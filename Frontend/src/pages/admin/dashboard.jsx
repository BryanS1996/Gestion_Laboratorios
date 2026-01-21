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

// Registrar Chart.js (OBLIGATORIO)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { stats, reservas, loading, error } = useDashboard();

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  /* =========================
     MÉTRICA 1:
     Reservas por laboratorio
     ========================= */
  const reservasPorLab = reservas.reduce((acc, r) => {
    const lab = r.laboratorioId || 'Desconocido';
    acc[lab] = (acc[lab] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(reservasPorLab);
  const values = Object.values(reservasPorLab);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Reservas por laboratorio',
        data: values,
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* TÍTULO */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-gray-500">
          Resumen general del uso de laboratorios
        </p>
      </div>

      {/* CARDS DE STATS */}
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
            {stats?.laboratoriosOcupados ?? '0/0'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Reportes pendientes</p>
          <p className="text-2xl font-semibold">
            {stats?.reportesPendientes ?? 0}
          </p>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">
          Laboratorios más utilizados
        </h2>

        {labels.length === 0 ? (
          <p className="text-gray-500">No hay reservas para mostrar</p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {/* INFO EXTRA */}
      <p className="text-sm text-gray-500">
        Total de reservas analizadas: {reservas.length}
      </p>
    </div>
  );
};

export default Dashboard;
