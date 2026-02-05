import StatusBadge from './StatusBadge';
import { fmtHoraBloque, fmtFechaHora } from '../utils/formatters';

export default function LabCard({ lab }) {
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-lg text-slate-900">{lab.nombre}</h2>
          <p className="text-xs text-slate-600">{lab.id}</p>
        </div>
        <StatusBadge ocupado={lab.ocupado} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium mb-2 text-slate-900">Horarios reservados</p>

        {lab.horarios.length === 0 ? (
          <p className="text-xs text-slate-500">Sin reservas</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {lab.horarios.map((r, i) => (
              <div key={i} className="text-xs border rounded-md p-2 bg-slate-50">
                <p className="font-medium text-slate-900">{fmtHoraBloque(r.horaInicio, r.horaFin)}</p>
                <p className="text-slate-600 truncate">{r.userEmail || '—'}</p>
                <p className="text-[10px] capitalize text-slate-600">{r.estado}</p>
                {r.createdAt && (
                  <p className="text-[10px] text-slate-500 mt-1">Creada: {fmtFechaHora(r.createdAt)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-600">Total reservas: {lab.horarios.length}</div>
    </div>
  );
}
