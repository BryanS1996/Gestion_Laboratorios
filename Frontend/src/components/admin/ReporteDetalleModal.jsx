const ReporteDetalleModal = ({ reporte, onClose }) => {
  if (!reporte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        
        {/* ❌ Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* TÍTULO */}
        <h2 className="text-xl font-bold mb-2">
          {reporte.titulo}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Reporte generado el{' '}
          {new Date(reporte.fechaCreacion).toLocaleString('es-EC')}
        </p>

        {/* INFO */}
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Usuario:</span>{' '}
            {reporte.userEmail}
          </div>

          <div>
            <span className="font-semibold">Laboratorio:</span>{' '}
            {reporte.laboratorioNombre}
          </div>

          <div>
            <span className="font-semibold">Estado:</span>{' '}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                reporte.estado === 'pendiente'
                  ? 'bg-yellow-100 text-yellow-800'
                  : reporte.estado === 'revisado'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {reporte.estado}
            </span>
          </div>

          <div>
            <span className="font-semibold">Descripción:</span>
            <p className="mt-1 text-gray-700">
              {reporte.descripcion}
            </p>
          </div>
        </div>

        {/* FUTURO: imagen */}
        {reporte.imageKey && (
          <div className="mt-4">
            <p className="font-semibold text-sm mb-1">Imagen adjunta:</p>
            <img
              src={reporte.imageKey}
              alt="Reporte"
              className="rounded border max-h-48"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteDetalleModal;
