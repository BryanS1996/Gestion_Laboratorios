import { DateTime } from "luxon";
import { ZONE } from "../../config/env";

export function todayISO() {
  return DateTime.now().setZone(ZONE).toISODate();
}

// Accepts: YYYY-MM-DD, ISO string, Firestore Timestamp-like objects
export function toISODate(fecha) {
  if (!fecha) return null;

  // Already YYYY-MM-DD
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;

  // ISO string
  if (typeof fecha === "string") {
    const dt = DateTime.fromISO(fecha, { zone: "utc" });
    if (dt.isValid) return dt.toISODate();
    return fecha.split("T")[0];
  }

  // Firestore timestamp-like
  const seconds = fecha.seconds ?? fecha._seconds;
  if (seconds) {
    // Use UTC for storage normalization (avoid day shift)
    return DateTime.fromSeconds(seconds, { zone: "utc" }).toISODate();
  }

  return null;
}

export function formatISOToLocale(isoDate, locale = "es-ES") {
  if (!isoDate) return "—";
  const dt = DateTime.fromISO(isoDate, { zone: ZONE });
  return dt.isValid
    ? dt.setLocale(locale).toLocaleString(DateTime.DATE_MED)
    : isoDate;
}

export function timeRange(horaInicio, horaFin) {
  const hi = String(horaInicio).padStart(2, "0");
  const hf = String(horaFin).padStart(2, "0");
  return `${hi}:00 - ${hf}:00`;
}
