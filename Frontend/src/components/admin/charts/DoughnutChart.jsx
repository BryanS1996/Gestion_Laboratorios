import DoughnutChartBase from '../../../shared/chart/DoughnutChart';
import { getReservationColors } from '../../../config/theme.config';

const DoughnutChart = ({ dataStats }) => {
  const pendiente = dataStats?.pendiente ?? 0;
  const confirmada = dataStats?.confirmada ?? 0;

  // To aggregate cancelled_by_priority within the cancelled category:
  const cancelada =
    (dataStats?.cancelada ?? 0) + (dataStats?.cancelada_por_prioridad ?? 0);

  const data = {
    labels: ['Pendiente', 'Confirmada', 'Cancelada'],
    datasets: [
      {
        data: [pendiente, confirmada, cancelada],
        backgroundColor: getReservationColors(false),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div className="bg-white p-6 rounded-lg border h-full">
      <h2 className="text-lg font-semibold mb-4">Estado de reservas</h2>
      <div className="h-64">
        <DoughnutChartBase data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
