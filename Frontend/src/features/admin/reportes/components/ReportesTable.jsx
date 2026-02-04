import EstadoSelect from './EstadoSelect';

export default function ReportesTable({ reportes, onRowClick, onChangeEstado }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Laboratorio</th>
            <th className="p-3 text-left">Usuario</th>
            <th className="p-3 text-left">Título</th>
            <th className="p-3 text-left">Estado</th>
          </tr>
        </thead>

        <tbody>
          {reportes.map((r) => (
            <tr
              key={r._id}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(r)}
            >
              <td className="p-3">
                {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-EC') : '—'}
              </td>
              <td className="p-3">{r.laboratorioNombre || '—'}</td>
              <td className="p-3">{r.userEmail || '—'}</td>
              <td className="p-3">{r.titulo || '—'}</td>
              <td className="p-3">
                <EstadoSelect value={r.estado} onChange={(estado) => onChangeEstado(r._id, estado)} />
              </td>
            </tr>
          ))}

          {reportes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                No hay reportes con esos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
