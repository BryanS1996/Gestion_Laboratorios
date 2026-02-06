import {
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Badge, Button, Card, Spinner } from "../../../shared/components";
import { formatISOToLocale, toISODate } from "../../../shared/utils/dates";

function statusMeta(estado) {
  switch (estado) {
    case "pendiente":
      return { icon: <Clock size={18} />, label: "Pendiente", className: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100" };
    case "resuelto":
      return { icon: <CheckCircle size={18} />, label: "Resuelto", className: "bg-green-50 text-green-700 ring-1 ring-green-100" };
    default:
      return { icon: <Clock size={18} />, label: estado || "Estado", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" };
  }
}

export default function ReporteCard({
  reporte,
  imageUrl,
  loadingImage,
  onToggleImage,
  onDelete,
}) {
  const meta = statusMeta(reporte.estado);
  // Use fechaCreacion instead of fecha for report creation date
  const iso = reporte.fechaCreacion ? new Date(reporte.fechaCreacion).toISOString().split('T')[0] : null;
  const fechaLabel = iso ? formatISOToLocale(iso) : "Sin fecha";

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Laboratory name with icon */}
        {reporte.laboratorioNombre && (
          <div className="mb-3 pb-3 border-b border-slate-200">
            <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Laboratorio</p>
            <p className="text-base font-bold text-blue-600 mt-1">{reporte.laboratorioNombre}</p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{reporte.titulo}</h3>
            <p className="text-sm text-slate-600 mt-1">{fechaLabel}</p>
          </div>

          <Badge className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${meta.className}`}>
            {meta.icon}
            {meta.label}
          </Badge>
        </div>

        {/* Description/Detail */}
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-2">Detalle</p>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{reporte.descripcion}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {reporte.imageKey && (
            <Button
              variant="secondary"
              type="button"
              onClick={() => onToggleImage(reporte._id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            >
              <ImageIcon size={16} />
              {imageUrl ? "Ocultar imagen" : "Ver imagen"}
              {imageUrl ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}

          <Button
            variant="secondary"
            type="button"
            onClick={() => onDelete(reporte._id)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-700 border-red-200 hover:bg-red-50"
          >
            <Trash2 size={16} /> Eliminar
          </Button>
        </div>

        {/* Image section - always visible if exists */}
        {reporte.imageKey && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-slate-600 font-semibold mb-3">Evidencia fotográfica</p>

            {loadingImage && (
              <div className="text-sm text-slate-600 inline-flex items-center gap-2 py-4">
                <Spinner />
                <span>Cargando imagen...</span>
              </div>
            )}

            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imageUrl}
                  alt="Evidencia del reporte"
                  className="w-full max-h-[500px] object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
