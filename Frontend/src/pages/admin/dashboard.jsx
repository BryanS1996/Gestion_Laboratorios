import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/admin/Spinner';
import DoughnutChart from '../../components/admin/charts/DoughnutChart';
import { DateTime } from 'luxon';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  /* ================= AUTH ================= */
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

const ZONE = 'America/Guayaquil';
  const [fecha, setFecha] = useState(
    DateTime.now().setZone(ZONE).toISODate()
  );

  const {
    data,
    isLoading: loading,
    error,
  } = useDashboard(fecha);

  const stats = data?.stats ?? {};
  const reservas = data?.reservas ?? [];

  /* ================= GUARDS ================= */
  if (authLoading || loading) return <Spinner />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  if (error) return <p className="text-red-600">{String(error)}</p>;

  /* ================= ESTADO RESERVAS ================= */
  const estadoReservas = reservas.reduce(
    (acc, r) => {
      const estado = r.estado || 'pendiente';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    { pendiente: 0, confirmada: 0, cancelada: 0, cancelada_por_prioridad: 0 }
  );

  /* ================= LABORATORIOS ================= */
  const reservasPorLab = reservas.reduce((acc, r) => {
    const lab = r.laboratorioId || 'Desconocido';
    acc[lab] = (acc[lab] || 0) + 1;
    return acc;
  }, {});

  const labsChartData = {
    labels: Object.keys(reservasPorLab),
    datasets: [
      {
        label: 'Reservas por laboratorio',
        data: Object.values(reservasPorLab),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  /* ================= HORARIOS (BLOQUES FIJOS) ================= */
  const bloques = [
    { label: '07:00 - 09:00', start: 7, end: 9 },
    { label: '09:00 - 11:00', start: 9, end: 11 },
    { label: '11:00 - 13:00', start: 11, end: 13 },
    { label: '14:00 - 16:00', start: 14, end: 16 },
    { label: '16:00 - 18:00', start: 16, end: 18 },
  ];

  const bloquesMap = {};
  bloques.forEach(b => (bloquesMap[b.label] = 0));

  reservas.forEach((r) => {
    bloques.forEach((b) => {
      if (
        r.horaInicio < b.end &&
        r.horaFin > b.start
      ) {
        bloquesMap[b.label]++;
      }
    });
  });

  const horariosChartData = {
    labels: Object.keys(bloquesMap),
    datasets: [
      {
        label: 'Reservas por bloque horario',
        data: Object.values(bloquesMap),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
    ],
  };

  /* ================= USUARIOS ================= */
  const usuariosMap = {};
  reservas.forEach((r) => {
    const u = r.userEmail || r.userId || 'Desconocido';
    usuariosMap[u] = (usuariosMap[u] || 0) + 1;
  });

  const topUsuarios = Object.entries(usuariosMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const usuariosChartData = {
    labels: topUsuarios.map(([u]) => u),
    datasets: [
      {
        label: 'Reservas por usuario',
        data: topUsuarios.map(([, t]) => t),
        backgroundColor: '#9333ea',
        borderRadius: 6,
      },
    ],
  };

  /* ================= OPTIONS ================= */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <p className="text-gray-500 text-sm">
            Uso de laboratorios – {fecha}
          </p>
        </div>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Reservas del día" value={stats?.reservasHoy} />
        <Card title="Laboratorios ocupados" value={stats?.laboratoriosOcupados} />
        <Card title="Reportes pendientes" value={stats?.reportesPendientes ?? 0} />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartBox title="Laboratorios más utilizados">
          {labsChartData.labels.length === 0
            ? <Empty />
            : <Bar data={labsChartData} options={chartOptions} />}
        </ChartBox>

        <ChartBox title="Estado de reservas">
          <DoughnutChart dataStats={estadoReservas} />
        </ChartBox>

        <ChartBox title="Horarios más concurridos">
          {horariosChartData.labels.length === 0
            ? <Empty />
            : <Bar data={horariosChartData} options={chartOptions} />}
        </ChartBox>

        <ChartBox title="Usuarios que más reservan">
          {usuariosChartData.labels.length === 0
            ? <Empty />
            : <Bar data={usuariosChartData} options={chartOptions} />}
        </ChartBox>

      </div>
    </div>
  );
};

/* ================= COMPONENTES ================= */

const Card = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl border hover:shadow-md transition">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold">{value ?? 0}</p>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div className="bg-white p-4 rounded-xl border flex flex-col h-[320px]">
    <h2 className="text-sm font-semibold mb-3">{title}</h2>
    <div className="flex-1">{children}</div>
  </div>
);

const Empty = () => (
  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
    Sin datos para mostrar
  </div>
);

export default Dashboard;
