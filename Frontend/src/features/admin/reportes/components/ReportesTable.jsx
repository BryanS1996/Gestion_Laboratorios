import EstadoSelect from './EstadoSelect';

export default function ReportesTable({ reportes, onRowClick, onChangeEstado }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left font-semibold text-slate-900">Fecha</th>
            <th className="p-3 text-left font-semibold text-slate-900">Laboratorio</th>
            <th className="p-3 text-left font-semibold text-slate-900">Usuario</th>
            <th className="p-3 text-left font-semibold text-slate-900">Título</th>
            <th className="p-3 text-left font-semibold text-slate-900">Estado</th>
          </tr>
        </thead>

        <tbody>
          {reportes.map((r) => (
            <tr
              key={r._id}
              className="border-t hover:bg-slate-50 cursor-pointer"
              onClick={() => onRowClick(r)}
            >
              <td className="p-3 text-slate-900">
                {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-EC') : '—'}
              </td>
              <td className="p-3 text-slate-900">{r.laboratorioNombre || '—'}</td>
              <td className="p-3 text-slate-700">{r.userEmail || '—'}</td>
              <td className="p-3 text-slate-900 font-medium">{r.titulo || '—'}</td>
              <td className="p-3">
                <EstadoSelect value={r.estado} onChange={(estado) => onChangeEstado(r._id, estado)} />
              </td>
            </tr>
          ))}

          {reportes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-600 italic">
                No hay reportes con esos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
