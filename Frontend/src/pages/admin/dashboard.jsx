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
  const { stats, reservas, horarios, topUsuarios, loading, error } = useDashboard();

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p>{String(error)}</p>;

  /* =========================
     GRÁFICO 1:
     Reservas por laboratorio
     ========================= */
  const reservasPorLab = reservas.reduce((acc, r) => {
    const lab = r.laboratorioId || 'Desconocido';
    acc[lab] = (acc[lab] || 0) + 1;
    return acc;
  }, {});

  const labsLabels = Object.keys(reservasPorLab);
  const labsValues = Object.values(reservasPorLab);

  const labsChartData = {
    labels: labsLabels,
    datasets: [
      {
        label: 'Reservas por laboratorio',
        data: labsValues,
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  /* =========================
     GRÁFICO 2:
     Horarios más concurridos
     ========================= */
  const horariosChartData = {
    labels: horarios.map(h => h.hora),
    datasets: [
      {
        label: 'Reservas por horario',
        data: horarios.map(h => h.total),
        backgroundColor: '#16a34a',
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
  /* =========================
   GRÁFICO 3:
   Usuarios que más reservan
   ========================= */
const usuariosChartData = {
  labels: topUsuarios.map(u => u.usuario),
  datasets: [
    {
      label: 'Reservas por usuario',
      data: topUsuarios.map(u => u.total),
      backgroundColor: '#9333ea', // morado
      borderRadius: 6,
    },
  ],
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

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            Laboratorios más utilizados
          </h2>

          {labsLabels.length === 0 ? (
            <p className="text-gray-500">No hay reservas para mostrar</p>
          ) : (
            <Bar data={labsChartData} options={chartOptions} />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">
            Horarios más concurridos
          </h2>

          <Bar data={horariosChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">
          Usuarios que más reservan
        </h2>

        <Bar data={usuariosChartData} options={chartOptions} />
      </div>


      {/* FOOTER */}
      <p className="text-sm text-gray-500">
        Total de reservas analizadas: {reservas.length}
      </p>
    </div>
  );
};

export default Dashboard;
