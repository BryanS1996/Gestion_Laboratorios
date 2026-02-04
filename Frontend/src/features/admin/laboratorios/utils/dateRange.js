import { DateTime } from 'luxon';
import { ZONE } from '../../../../config/env';

/**
 * Construye un rango basado en una fecha ISO (yyyy-mm-dd) y un modo.
 * mode: 'day' | 'week' | 'month'
 */
export const buildRange = (baseISO, mode) => {
  const base = DateTime.fromISO(String(baseISO), { zone: ZONE });
  if (!base.isValid) return null;

  if (mode === 'day') {
    const start = base.startOf('day');
    const end = start.plus({ days: 1 });
    return { start, end, label: start.toFormat('dd/LL/yyyy') };
  }

  if (mode === 'week') {
    // Lunes fijo
    const start = base.set({ weekday: 1 }).startOf('day');
    const end = start.plus({ days: 7 });
    return {
      start,
      end,
      label: `${start.toFormat('dd/LL/yyyy')} - ${end.minus({ days: 1 }).toFormat('dd/LL/yyyy')}`,
    };
  }

  // month
  const start = base.startOf('month');
  const end = start.plus({ months: 1 });
  return {
    start,
    end,
    label: start.toFormat('LLLL yyyy'),
  };
};

export const eachDayISO = (range) => {
  const days = [];
  let cursor = range.start;
  while (cursor < range.end) {
    days.push(cursor.toISODate());
    cursor = cursor.plus({ days: 1 });
  }
  return days;
};
