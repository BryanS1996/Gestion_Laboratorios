import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/admin/Spinner';
import DoughnutChart from '../../components/admin/charts/DoughnutChart';
import SkeletonChart from '../../components/admin/charts/SkeletonChart';

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
  // 🔐 AUTH
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const {
    data,
    isLoading: loading,
    error,
  } = useDashboard(fecha);

  const stats = data?.stats ?? {};
  const reservas = data?.reservas ?? [];
  
  const estadoReservas = reservas.reduce(
  (acc, r) => {
    const estado = r.estado || 'pendiente';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  },
  {
    pendiente: 0,
    aprobada: 0,
    cancelada: 0,
  }
);

  // ⏳ LOADING GLOBAL
  if (authLoading || loading) {
    return <Spinner />;
  }

  // ⛔ NO ADMIN
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return <p className="text-red-600">{String(error)}</p>;
  }

  /* =========================
     GRÁFICO 1: LABS
     ========================= */
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

  /* =========================
     GRÁFICO 2: HORARIOS
     ========================= */
  const horariosMap = {};

  reservas.forEach((r) => {
    if (!r.horaInicio || !r.horaFin) return;
    for (let h = r.horaInicio; h < r.horaFin; h++) {
      horariosMap[h] = (horariosMap[h] || 0) + 1;
    }
  });

  const horariosOrdenados = Object.entries(horariosMap).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  const horariosChartData = {
    labels: horariosOrdenados.map(([h]) => `${h}:00`),
    datasets: [
      {
        label: 'Reservas por horario',
        data: horariosOrdenados.map(([, t]) => t),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
    ],
  };

  /* =========================
     GRÁFICO 3: USUARIOS
     ========================= */
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

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 overflow-hidden animate-fade-in">
      
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
      <div className="grid grid-cols-3 gap-4">
        <Card title="Reservas del día" value={stats?.reservasHoy} />
        <Card title="Laboratorios ocupados" value={stats?.laboratoriosOcupados} />
        <Card title="Reportes pendientes" value={stats?.reportesPendientes ?? 0} />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1">

        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
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
          </>
        )}

      </div>
    </div>
  );
};

/* ================= COMPONENTES ================= */

const Card = ({ title, value }) => (
  <div className="
    bg-white p-4 rounded-lg border
    transition-all duration-200
    hover:shadow-md hover:-translate-y-0.5
  ">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold">{value ?? 0}</p>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg border flex flex-col">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="flex-1">{children}</div>
  </div>
);

const Empty = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-400 text-sm">Sin datos para mostrar</p>
  </div>
);

export default Dashboard;
