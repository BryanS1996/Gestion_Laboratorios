import { DateTime } from "luxon";

const ZONE = "America/Guayaquil";

export const getMonthRangeISO = (isoMonth /* "YYYY-MM" */) => {
  const start = DateTime.fromFormat(String(isoMonth), "yyyy-MM", { zone: ZONE }).startOf("month");
  const end = start.plus({ months: 1 });
  return { start: start.toISODate(), end: end.toISODate() };
};

export const formatMonthLabel = (isoMonth) => {
  const dt = DateTime.fromFormat(String(isoMonth), "yyyy-MM", { zone: ZONE });
  return dt.isValid ? dt.toFormat("LLLL yyyy") : isoMonth; // "enero 2026"
};
