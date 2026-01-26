// Frontend/src/pages/admin/dashboard.jsx
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import Spinner from '../../components/admin/Spinner';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ZONE = 'America/Guayaquil';

const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [periodo, setPeriodo] = useState('day');
  const [fecha, setFecha] = useState(DateTime.now().setZone(ZONE).toISODate());

  // 🔥 IMPORTANTE: el hook recibe fecha + periodo (backend debe soportarlo)
  const { data, isLoading, error } = useDashboard(fecha, periodo);

  const reservas = data?.reservas ?? [];
  const stats = data?.stats ?? {};

  const periodoLabel = useMemo(() => {
    if (periodo === 'day') return 'Día';
    if (periodo === 'week') return 'Semana';
    return 'Mes';
  }, [periodo]);

  /* =========================
     1) Reservas por laboratorio (gráfico principal)
  ========================== */
  const chartReservasPorLab = useMemo(() => {
    const counts = {};
    reservas.forEach((r) => {
      const name = r.laboratorioNombre || r.laboratorioId || 'Desconocido';
      counts[name] = (counts[name] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);

    return {
      labels,
      datasets: [
        {
          label: `Reservas por laboratorio (${periodoLabel})`,
          data: values,
          backgroundColor: '#2563eb',
          borderRadius: 8,
        },
      ],
    };
  }, [reservas, periodoLabel]);

  /* =========================
     2) Top 5 usuarios con más reservas
  ========================== */
  const chartTopUsuarios = useMemo(() => {
    const counts = {};
    reservas.forEach((r) => {
      const email = r.userEmail || r.email || r.userId || 'Desconocido';
      counts[email] = (counts[email] || 0) + 1;
    });

    const top5 = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: top5.map(([k]) => k),
      datasets: [
        {
          label: `Top 5 usuarios (${periodoLabel})`,
          data: top5.map(([, v]) => v),
          backgroundColor: '#0ea5e9',
          borderRadius: 8,
        },
      ],
    };
  }, [reservas, periodoLabel]);

  /* =========================
     3) Slots fijos: 5 horarios (siempre salen aunque tengan 0)
  ========================== */
  const chartSlots = useMemo(() => {
    // inicializa con los 5 slots
    const counts = {};
    DEFAULT_SLOTS.forEach((s) => (counts[s.label] = 0));

    reservas.forEach((r) => {
      const hi = Number(r.horaInicio);
      const hf = Number(r.horaFin);
      const match = DEFAULT_SLOTS.find((s) => s.start === hi && s.end === hf);
      if (match) counts[match.label] += 1;
    });

    const labels = DEFAULT_SLOTS.map((s) => s.label);
    const values = labels.map((l) => counts[l] ?? 0);

    return {
      labels,
      datasets: [
        {
          label: `Reservas por slot (${periodoLabel})`,
          data: values,
          backgroundColor: '#22c55e',
          borderRadius: 8,
        },
      ],
    };
  }, [reservas, periodoLabel]);

  /* =========================
     4) Estado de reservas (Doughnut)
  ========================== */
  const estadoCounts = useMemo(() => {
    const base = {
      confirmada: 0,
      pendiente: 0,
      cancelada: 0,
      cancelada_por_prioridad: 0,
    };

    reservas.forEach((r) => {
      const est = String(r.estado || 'pendiente').toLowerCase();
      if (base[est] == null) base[est] = 0;
      base[est] += 1;
    });

    return base;
  }, [reservas]);

  const doughnutData = useMemo(() => {
    return {
      labels: ['Confirmada', 'Pendiente', 'Cancelada', 'Cancelada (Prioridad)'],
      datasets: [
        {
          data: [
            estadoCounts.confirmada ?? 0,
            estadoCounts.pendiente ?? 0,
            estadoCounts.cancelada ?? 0,
            estadoCounts.cancelada_por_prioridad ?? 0,
          ],
          backgroundColor: ['#22c55e', '#facc15', '#ef4444', '#f59e0b'],
          borderWidth: 1,
        },
      ],
    };
  }, [estadoCounts]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  /* =========================
     UI states
  ========================== */
  if (authLoading || isLoading) return <Spinner />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  if (error) return <p className="text-red-600">{String(error)}</p>;

  const totalPeriodo = stats?.totalPeriodo ?? reservas.length;
  const totalDia = stats?.reservasHoy ?? 0;
  const reportesPend = stats?.reportesPendientes ?? 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in p-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <p className="text-gray-500 text-sm italic">
            Uso de laboratorios – {fecha} · <span className="font-bold text-blue-600">{periodoLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded px-3 py-2 text-sm shadow-sm"
          />

          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            {['day', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  periodo === p ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="TOTAL DEL PERIODO" value={totalPeriodo} subtitle={`(${periodoLabel})`} />
        <Card title="TOTAL DEL DÍA" value={totalDia} subtitle="Reservas" />
        <Card title="REPORTES PENDIENTES" value={reportesPend} subtitle="En revisión" />
      </div>

      {/* ✅ GRÁFICO PRINCIPAL */}
      <ChartBox title={`Estadísticas por ${periodoLabel}`} height="h-[420px]">
        {chartReservasPorLab.labels.length === 0 ? (
          <Empty />
        ) : (
          <Bar
            data={chartReservasPorLab}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { maxRotation: 0, autoSkip: true } },
                y: { beginAtZero: true, ticks: { precision: 0 } },
              },
            }}
          />
        )}
      </ChartBox>

      {/* ✅ ABAJO: Top 5 usuarios + Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title={`Top 5 usuarios (${periodoLabel})`} height="h-[320px]">
          {chartTopUsuarios.labels.length === 0 ? (
            <Empty />
          ) : (
            <Bar
              data={chartTopUsuarios}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          )}
        </ChartBox>

        <ChartBox title={`Slots más reservados (${periodoLabel})`} height="h-[320px]">
          <Bar
            data={chartSlots}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </ChartBox>
      </div>

      {/* ✅ Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title={`Estado de reservas (${periodoLabel})`} height="h-[320px]">
          {reservas.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-full">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          )}
        </ChartBox>

        <ChartBox title="Info" height="h-[320px]">
          <div className="text-sm text-gray-500">
            <p><b>Rango:</b> {stats?.rango?.start ?? '—'} → {stats?.rango?.end ?? '—'}</p>
            <p className="mt-2"><b>Actualizado:</b> {stats?.updatedAt ?? '—'}</p>
          </div>
        </ChartBox>
      </div>
    </div>
  );
};

const Card = ({ title, value, subtitle }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{title}</p>
    <p className="text-3xl font-semibold text-slate-800">{value ?? 0}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const ChartBox = ({ title, children, height = 'h-[320px]' }) => (
  <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm ${height} flex flex-col`}>
    <h2 className="text-sm font-bold mb-3 text-gray-700">{title}</h2>
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);

const Empty = () => (
  <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
    No hay datos
  </div>
);

export default Dashboard;
