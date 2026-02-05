import { Badge, Modal } from "../../../../shared/components";

const isLikelyUrl = (v) => {
  const s = String(v || "");
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:");
};

export default function ReporteDetalleModal({ reporte, onClose }) {
  const isOpen = Boolean(reporte);

  const badgeVariant =
    reporte?.estado === "pendiente"
      ? "yellow"
      : reporte?.estado === "revisado"
        ? "blue"
        : "green";

  return (
    <Modal
      isOpen={isOpen}
      title={reporte?.titulo || "Detalle del reporte"}
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <p className="text-sm text-slate-600 mb-4">
        Reporte generado el{" "}
        {reporte?.fechaCreacion
          ? new Date(reporte.fechaCreacion).toLocaleString("es-EC")
          : "—"}
      </p>

      <div className="space-y-3 text-sm text-slate-700">
        <div>
          <span className="font-semibold">Usuario:</span> {reporte?.userEmail || "—"}
        </div>
        <div>
          <span className="font-semibold">Laboratorio:</span>{" "}
          {reporte?.laboratorioNombre || "—"}
        </div>
        <div>
          <span className="font-semibold">Estado:</span>{" "}
          <Badge variant={badgeVariant}>{reporte?.estado || "—"}</Badge>
        </div>
        <div>
          <span className="font-semibold text-slate-900">Descripción:</span>
          <p className="mt-1 text-slate-700">{reporte?.descripcion || "—"}</p>
        </div>
      </div>

      {reporte?.imageKey && isLikelyUrl(reporte.imageKey) && (
        <div className="mt-4">
          <p className="font-semibold text-sm mb-1 text-slate-900">Imagen adjunta:</p>
          <img src={reporte.imageKey} alt="Reporte" className="rounded border max-h-48 w-full object-contain" />
        </div>
      )}
    </Modal>
  );
}
