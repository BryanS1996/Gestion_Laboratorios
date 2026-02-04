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
  const iso = toISODate(reporte.fecha);
  const fechaLabel = iso ? formatISOToLocale(iso) : "Sin fecha";

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{reporte.titulo}</h3>
            <p className="text-sm text-slate-500 mt-1">{fechaLabel}</p>
          </div>

          <Badge className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${meta.className}`}>
            {meta.icon}
            {meta.label}
          </Badge>
        </div>

        <p className="mt-4 text-slate-700 whitespace-pre-wrap">{reporte.descripcion}</p>

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

        {loadingImage && (
          <div className="mt-3 text-sm text-slate-600 inline-flex items-center gap-2">
            <Spinner />
            <span>Cargando imagen...</span>
          </div>
        )}

        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Evidencia"
              className="w-full max-h-[420px] object-contain rounded-xl border border-slate-100"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
