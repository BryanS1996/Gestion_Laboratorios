const SkeletonChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg border animate-pulse flex flex-col">
      {/* Título */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />

      {/* Gráfico falso */}
      <div className="flex-1 bg-gray-200 rounded" />
    </div>
  );
};

export default SkeletonChart;