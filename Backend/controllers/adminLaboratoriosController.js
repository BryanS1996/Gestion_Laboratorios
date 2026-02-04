const admin = require('../firebaseAdmin');
const db = admin.firestore();
const { DateTime } = require('luxon');

const ZONE = 'America/Guayaquil';

const getAdminLaboratoriosEstado = async (req, res) => {
  try {
    const { fecha } = req.query; // "YYYY-MM-DD"
    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    // 1) Range of the day in zone Ecuador
    const startDT = DateTime.fromISO(String(fecha), { zone: ZONE }).startOf('day');
    if (!startDT.isValid) return res.status(400).json({ error: 'Fecha inválida' });
    const endDT = startDT.plus({ days: 1 });

    const start = startDT.toJSDate();
    const end = endDT.toJSDate();

    // 2) Load ALL laboratories (so that they are displayed even if they have no reservations)
    const labsSnap = await db.collection('laboratorios').get();
    const labsMap = {};

    labsSnap.forEach((doc) => {
      const l = doc.data() || {};
      labsMap[doc.id] = {
        laboratorioId: doc.id,
        laboratorioNombre: l.nombre || l.laboratorioNombre || 'Sin nombre',
        tipo: l.tipo || 'normal',
        tipoAcceso: l.tipoAcceso || 'basico',
        estadoLab: l.estado || 'Disponible',
        ocupado: false,
        horarios: [],
      };
    });

    // 3) Fetch reservations of the day by range (avoids the string date vs timestamp bug)
    const reservasSnap = await db
      .collection('reservas')
      .where('fecha', '>=', start)
      .where('fecha', '<', end)
      .get();

    reservasSnap.forEach((doc) => {
      const r = doc.data() || {};
      if (!r.laboratorioId) return;

      // If the lab doesn't exist in the collection, we create a “fallback”
      if (!labsMap[r.laboratorioId]) {
        labsMap[r.laboratorioId] = {
          laboratorioId: r.laboratorioId,
          laboratorioNombre: r.laboratorioNombre || 'Sin nombre',
          tipo: r.tipo || 'normal',
          tipoAcceso: r.tipoAcceso || 'basico',
          estadoLab: '—',
          ocupado: false,
          horarios: [],
        };
      }

      // Save the schedule
      labsMap[r.laboratorioId].horarios.push({
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
        estado: r.estado,
        userEmail: r.userEmail,
        createdAt: r.createdAt || null,
      });

      // Occupied if any reservation is active
      if (r.estado === 'confirmada' || r.estado === 'pendiente') {
        labsMap[r.laboratorioId].ocupado = true;
      }
    });

    // 4) Sort schedules by horaInicio
    Object.values(labsMap).forEach((lab) => {
      lab.horarios.sort((a, b) => Number(a.horaInicio) - Number(b.horaInicio));
    });

    return res.json({
      fecha,
      laboratorios: Object.values(labsMap),
    });
  } catch (error) {
    console.error('[getAdminLaboratoriosEstado]', error);
    return res.status(500).json({ error: 'Error obteniendo estado de laboratorios' });
  }
};

module.exports = {
  getAdminLaboratoriosEstado,
};
