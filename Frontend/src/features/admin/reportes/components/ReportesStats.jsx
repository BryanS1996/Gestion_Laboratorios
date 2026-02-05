export default function ReportesStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-slate-600">Total</div>
        <div className="text-lg font-bold text-slate-900">{stats.total ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-slate-600">Pendientes</div>
        <div className="text-lg font-bold text-slate-900">{stats.pendientes ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-slate-600">Revisados</div>
        <div className="text-lg font-bold text-slate-900">{stats.revisados ?? 0}</div>
      </div>
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-slate-600">Resueltos</div>
        <div className="text-lg font-bold text-slate-900">{stats.resueltos ?? 0}</div>
      </div>
    </div>
  );
}
