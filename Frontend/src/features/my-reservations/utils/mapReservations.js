import { toISODate, timeRange } from "../../../shared/utils/dates";

export function mapStatus(estado) {
  switch (estado) {
    case "confirmada":
      return { statusText: "Confirmada", statusClass: "bg-green-100 text-green-700 ring-1 ring-green-200" };
    case "pendiente":
      return { statusText: "Pendiente", statusClass: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200" };
    case "cancelada_por_prioridad":
      return { statusText: "Cancelada (Prioridad)", statusClass: "bg-amber-100 text-amber-800 ring-1 ring-amber-200" };
    case "cancelada":
      return { statusText: "Cancelada", statusClass: "bg-red-50 text-red-600 ring-1 ring-red-100" };
    case "cancelada_pago_fallido":
      return { statusText: "Pago fallido", statusClass: "bg-red-50 text-red-600 ring-1 ring-red-100" };
    default:
      return { statusText: "Desconocido", statusClass: "bg-slate-200 text-slate-700" };
  }
}

export function mapReservationForUI(r) {
  const { statusText, statusClass } = mapStatus(r.estado);
  const date = toISODate(r.fecha);
  return {
    ...r,
    labName: r.laboratorioNombre || r.laboratorioId,
    date: date || "—",
    time: timeRange(r.horaInicio, r.horaFin),
    statusText,
    statusClass,
  };
}
