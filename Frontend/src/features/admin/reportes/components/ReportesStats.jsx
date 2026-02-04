export default function ReportesStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-gray-500">Total</div>
        <div className="text-lg font-bold">{stats.total ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-gray-500">Pendientes</div>
        <div className="text-lg font-bold">{stats.pendientes ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-gray-500">Revisados</div>
        <div className="text-lg font-bold">{stats.revisados ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-gray-500">Resueltos</div>
        <div className="text-lg font-bold">{stats.resueltos ?? 0}</div>
      </div>
    </div>
  );
}
