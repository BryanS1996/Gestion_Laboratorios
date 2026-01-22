import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ dataStats }) => {
  const data = {
    labels: ['Pendiente', 'Aprobada', 'Cancelada'],
    datasets: [
      {
        data: [
          dataStats?.pendiente ?? 0,
          dataStats?.aprobada ?? 0,
          dataStats?.cancelada ?? 0,
        ],
        backgroundColor: [
          '#facc15', // amarillo
          '#22c55e', // verde
          '#ef4444', // rojo
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border h-full">
      <h2 className="text-lg font-semibold mb-4">
        Estado de reservas
      </h2>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
