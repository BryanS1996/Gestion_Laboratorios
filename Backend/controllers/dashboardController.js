const { DateTime } = require('luxon');
const ZONE = 'America/Guayaquil';

const { getReservasCache } = require('../realtime/reservasListener');

/* ============================
   📊 STATS GENERALES
   ============================ */
const getStats = async (req, res) => {
  try {
    const { reservas, updatedAt } = getReservasCache();

    const toDateTimeZone = (fecha) => {
      if (!fecha) return null;

      // Firestore Timestamp (admin)
      const seconds = fecha._seconds ?? fecha.seconds;
      if (seconds) {
        return DateTime.fromSeconds(seconds, { zone: 'utc' }).setZone(ZONE);
      }

      // Firestore Timestamp con toDate()
      if (typeof fecha.toDate === 'function') {
        return DateTime.fromJSDate(fecha.toDate()).setZone(ZONE);
      }

      // JS Date
      if (fecha instanceof Date) {
        return DateTime.fromJSDate(fecha).setZone(ZONE);
      }

      // string ISO o YYYY-MM-DD
      if (typeof fecha === 'string') {
        // si viene YYYY-MM-DD, esto lo toma como fecha en ZONE (no UTC)
        const dt = DateTime.fromISO(fecha, { zone: ZONE });
        return dt.isValid ? dt : null;
      }

      return null;
    };

    // fecha seleccionada (si no viene, hoy en Ecuador)
    const fechaParam = req.query.fecha
      ? DateTime.fromISO(req.query.fecha, { zone: ZONE }).startOf('day')
      : DateTime.now().setZone(ZONE).startOf('day');

    const reservasDia = reservas.filter((r) => {
      const dt = toDateTimeZone(r.fecha);
      if (!dt) return false;
      return dt.hasSame(fechaParam, 'day');
    });


    // Laboratorios ocupados en ese día (hora actual)
    const horaActual = DateTime.now().setZone(ZONE).hour;
    const labsOcupados = new Set();

    reservasDia.forEach(r => {
      if (r.horaInicio <= horaActual && r.horaFin > horaActual) {
        labsOcupados.add(r.laboratorioId);
      }
    });

    res.json({
      stats: {
        fecha: fechaParam.toISODate(),
        reservasHoy: reservasDia.length,
        laboratoriosOcupados: labsOcupados.size,
        reportesPendientes: null,
        updatedAt,
      },
      reservas: reservasDia, // 🔥 CLAVE
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error dashboard por fecha' });
  }
};
/* ============================
   📋 RESERVAS (CACHE)
   ============================ */
const getReservas = async (req, res) => {
  const { reservas } = getReservasCache();
  res.json({ reservas });
};

module.exports = {
  getStats,
  getReservas,
};
