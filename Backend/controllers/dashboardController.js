const { getReservasCache } = require('../realtime/reservasListener');

/* ============================
   📊 STATS GENERALES
   ============================ */
const getStats = async (req, res) => {
  try {
    const { reservas, updatedAt } = getReservasCache();

    const fechaParam = req.query.fecha
      ? new Date(req.query.fecha)
      : new Date();

    fechaParam.setHours(0, 0, 0, 0);

    // Reservas del día seleccionado
    const reservasDia = reservas.filter(r => {
      if (!r.fecha) return false;
      const f = new Date(r.fecha);
      f.setHours(0, 0, 0, 0);
      return f.getTime() === fechaParam.getTime();
    });

    // Laboratorios ocupados en ese día (hora actual)
    const horaActual = new Date().getHours();
    const labsOcupados = new Set();

    reservasDia.forEach(r => {
      if (r.horaInicio <= horaActual && r.horaFin > horaActual) {
        labsOcupados.add(r.laboratorioId);
      }
    });

    res.json({
      stats: {
        fecha: fechaParam.toISOString().slice(0, 10),
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
