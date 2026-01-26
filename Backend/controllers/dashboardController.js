const { DateTime } = require('luxon');
const ZONE = 'America/Guayaquil';

const { getReservasCache } = require('../realtime/reservasListener');

/* =========================
   Helpers
========================= */
const toDateTimeZone = (fecha) => {
  if (!fecha) return null;

  // Firestore Timestamp (admin)
  const seconds = fecha._seconds ?? fecha.seconds;
  if (seconds) return DateTime.fromSeconds(seconds, { zone: 'utc' }).setZone(ZONE);

  // Firestore Timestamp con toDate()
  if (typeof fecha?.toDate === 'function') return DateTime.fromJSDate(fecha.toDate()).setZone(ZONE);

  // JS Date
  if (fecha instanceof Date) return DateTime.fromJSDate(fecha).setZone(ZONE);

  // string ISO o YYYY-MM-DD
  if (typeof fecha === 'string') {
    const dt = DateTime.fromISO(fecha, { zone: ZONE });
    return dt.isValid ? dt : null;
  }

  return null;
};

const getRangeByPeriodo = (fechaISO, periodo = 'day') => {
  const base = (fechaISO
    ? DateTime.fromISO(fechaISO, { zone: ZONE })
    : DateTime.now().setZone(ZONE)
  ).startOf('day');

  if (periodo === 'week') {
    const start = base.startOf('week'); // lunes por defecto (según locale)
    const end = start.plus({ weeks: 1 });
    return { start, end, base };
  }

  if (periodo === 'month') {
    const start = base.startOf('month');
    const end = start.plus({ months: 1 });
    return { start, end, base };
  }

  // day
  const start = base.startOf('day');
  const end = start.plus({ days: 1 });
  return { start, end, base };
};

/* =========================
   📊 STATS (CACHE + PERIODO)
========================= */
const getStats = async (req, res) => {
  try {
    const { reservas, updatedAt } = getReservasCache();

    const periodo = (req.query.periodo || 'day').toLowerCase(); // day|week|month
    const fechaParamISO = req.query.fecha || DateTime.now().setZone(ZONE).toISODate();

    const { start, end, base } = getRangeByPeriodo(fechaParamISO, periodo);

    // ✅ Reservas del día (para el card “TOTAL DEL DÍA”)
    const reservasDia = reservas.filter((r) => {
      const dt = toDateTimeZone(r.fecha);
      return dt && dt.hasSame(base, 'day');
    });

    // ✅ Reservas del periodo (para semana/mes)
    const reservasPeriodo = reservas.filter((r) => {
      const dt = toDateTimeZone(r.fecha);
      return dt && dt >= start && dt < end;
    });

    // ✅ Labs ocupados (solo tiene sentido para el “día” seleccionado)
    const horaActual = DateTime.now().setZone(ZONE).hour;
    const labsOcupados = new Set();
    reservasDia.forEach((r) => {
      if (Number(r.horaInicio) <= horaActual && Number(r.horaFin) > horaActual) {
        labsOcupados.add(r.laboratorioId);
      }
    });

    return res.json({
      stats: {
        fecha: base.toISODate(),
        periodo,
        totalPeriodo: reservasPeriodo.length,   // clave para semana/mes
        reservasHoy: reservasDia.length,        // tu card “TOTAL DEL DÍA”
        laboratoriosOcupados: labsOcupados.size,
        reportesPendientes: null,
        updatedAt,
        rango: {
          start: start.toISODate(),
          end: end.toISODate(),
        },
      },

      // IMPORTANTE: devolvemos el periodo para que el gráfico sume bien
      reservas: reservasPeriodo,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error dashboard por fecha' });
  }
};

/* =========================
   📋 RESERVAS (CACHE)
========================= */
const getReservas = async (req, res) => {
  const { reservas } = getReservasCache();
  res.json({ reservas });
};

module.exports = {
  getStats,
  getReservas,
};
