import { DateTime } from 'luxon';
import { ZONE } from '../../../../config/env';

export const fmtHoraBloque = (horaInicio, horaFin) => {
  if (horaInicio == null || horaFin == null) return '—';
  const hi = DateTime.fromObject({ hour: Number(horaInicio), minute: 0 }, { zone: ZONE }).toFormat('HH:mm');
  const hf = DateTime.fromObject({ hour: Number(horaFin), minute: 0 }, { zone: ZONE }).toFormat('HH:mm');
  return `${hi}-${hf}`;
};

const toDT = (value) => {
  if (!value) return null;
  const seconds = value?._seconds ?? value?.seconds;
  if (seconds) return DateTime.fromSeconds(seconds, { zone: 'utc' }).setZone(ZONE);
  if (typeof value?.toDate === 'function') return DateTime.fromJSDate(value.toDate()).setZone(ZONE);
  if (value instanceof Date) return DateTime.fromJSDate(value).setZone(ZONE);
  if (typeof value === 'string') {
    const dt = DateTime.fromISO(value, { zone: ZONE });
    return dt.isValid ? dt : null;
  }
  return null;
};

export const fmtFechaHora = (value) => {
  const dt = toDT(value);
  return dt ? dt.toFormat('dd/LL/yyyy HH:mm') : '—';
};

export const fmtDateISOToLabel = (iso) => {
  const dt = DateTime.fromISO(String(iso), { zone: ZONE });
  return dt.isValid ? dt.toFormat('dd/LL/yyyy') : '—';
};
