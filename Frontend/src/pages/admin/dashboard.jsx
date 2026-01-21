import { useDashboard } from '../../hooks/useDashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const {
    stats,
    reservas = [],
    loading,
    error,
  } = useDashboard();

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p className="text-red-600">{String(error)}</p>;

  /* =========================
     GRÁFICO 1:
     Reservas por laboratorio
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
     GRÁFICO 2:
     Horarios más concurridos
     ========================= */
  const horariosMap = {};

  reservas.forEach((r) => {
    if (!r.horaInicio || !r.horaFin) return;

    for (let h = r.horaInicio; h < r.horaFin; h++) {
      horariosMap[h] = (horariosMap[h] || 0) + 1;
    }
  });

  const horariosOrdenados = Object.entries(horariosMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const horariosChartData = {
    labels: horariosOrdenados.map(([hora]) => `${hora}:00`),
    datasets: [
      {
        label: 'Reservas por horario',
        data: horariosOrdenados.map(([, total]) => total),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
    ],
  };

  /* =========================
     GRÁFICO 3:
     Usuarios que más reservan
     ========================= */
  const usuariosMap = {};

  reservas.forEach((r) => {
    const user = r.userEmail || r.userId || 'Desconocido';
    usuariosMap[user] = (usuariosMap[user] || 0) + 1;
  });

  const topUsuarios = Object.entries(usuariosMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const usuariosChartData = {
    labels: topUsuarios.map(([usuario]) => usuario),
    datasets: [
      {
        label: 'Reservas por usuario',
        data: topUsuarios.map(([, total]) => total),
        backgroundColor: '#9333ea',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="space-y-6">
      {/* TÍTULO */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-gray-500">
          Uso de laboratorios en tiempo real
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Reservas hoy</p>
          <p className="text-2xl font-semibold">
            {stats?.reservasHoy ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Laboratorios ocupados</p>
          <p className="text-2xl font-semibold">
            {stats?.laboratoriosOcupados ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Reportes pendientes</p>
          <p className="text-2xl font-semibold">
            {stats?.reportesPendientes ?? 0}
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            Laboratorios más utilizados
          </h2>
          {labsChartData.labels.length === 0 ? (
            <p className="text-gray-500">Sin datos</p>
          ) : (
            <Bar data={labsChartData} options={chartOptions} />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            Horarios más concurridos
          </h2>
          {horariosChartData.labels.length === 0 ? (
            <p className="text-gray-500">Sin datos</p>
          ) : (
            <Bar data={horariosChartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">
          Usuarios que más reservan
        </h2>
        {usuariosChartData.labels.length === 0 ? (
          <p className="text-gray-500">Sin datos</p>
        ) : (
          <Bar data={usuariosChartData} options={chartOptions} />
        )}
      </div>

      <p className="text-sm text-gray-500">
        Total de reservas analizadas: {reservas.length}
      </p>
    </div>
  );
};

export default Dashboard;
