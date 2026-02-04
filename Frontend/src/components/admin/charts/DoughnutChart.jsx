import DoughnutChartBase from '../../../shared/chart/DoughnutChart';

const DoughnutChart = ({ dataStats }) => {
  const pendiente = dataStats?.pendiente ?? 0;
  const confirmada = dataStats?.confirmada ?? 0;

  // Si quieres sumar cancelada_por_prioridad dentro de canceladas:
  const cancelada =
    (dataStats?.cancelada ?? 0) + (dataStats?.cancelada_por_prioridad ?? 0);

  const data = {
    labels: ['Pendiente', 'Confirmada', 'Cancelada'],
    datasets: [
      {
        data: [pendiente, confirmada, cancelada],
        backgroundColor: ['#facc15', '#22c55e', '#ef4444'],
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
