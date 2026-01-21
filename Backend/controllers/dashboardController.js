const { getReservasCache } = require('../realtime/reservasListener');

/* ============================
   📊 STATS GENERALES
   ============================ */
const getStats = async (req, res) => {
  try {
    const { reservas, updatedAt } = getReservasCache();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const reservasHoy = reservas.filter(r => {
      if (!r.fecha) return false;
      const f = new Date(r.fecha);
      f.setHours(0, 0, 0, 0);
      return f.getTime() === hoy.getTime();
    });

    const ahora = new Date().getHours();
    const labsOcupados = new Set();

    reservasHoy.forEach(r => {
      if (r.horaInicio <= ahora && r.horaFin > ahora) {
        labsOcupados.add(r.laboratorioId);
      }
    });

    res.json({
      stats: {
        reservasHoy: reservasHoy.length,
        laboratoriosOcupados: labsOcupados.size,
        reportesPendientes: 0,
        updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error dashboard stats' });
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
