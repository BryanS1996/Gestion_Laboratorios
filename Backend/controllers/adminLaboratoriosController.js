const admin = require('../firebaseAdmin');
const db = admin.firestore();
const { DateTime } = require('luxon');

const ZONE = 'America/Guayaquil';

const dayRange = (isoDate) => {
  const start = DateTime.fromISO(String(isoDate), { zone: ZONE }).startOf('day');
  if (!start.isValid) return null;
  const end = start.plus({ days: 1 });
  return { start: start.toJSDate(), end: end.toJSDate() };
};

const getAdminLaboratoriosEstado = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    const range = dayRange(fecha);
    if (!range) return res.status(400).json({ error: 'Fecha inválida' });

    // ✅ Para que el navegador/proxy no te cachee en 304
    res.set('Cache-Control', 'no-store');

    // ✅ 1) Reservas NUEVAS (fecha Date/Timestamp)
    const snapDate = await db
      .collection('reservas')
      .where('fecha', '>=', range.start)
      .where('fecha', '<', range.end)
      .get();

    // ✅ 2) Reservas VIEJAS (fecha string "YYYY-MM-DD")
    const snapString = await db
      .collection('reservas')
      .where('fecha', '==', fecha)
      .get();

    // ✅ Unimos sin duplicar
    const labsMap = {};
    const seenIds = new Set();

    const processDoc = (doc) => {
      if (seenIds.has(doc.id)) return;
      seenIds.add(doc.id);

      const r = doc.data();
      if (!r.laboratorioId) return;

      if (!labsMap[r.laboratorioId]) {
        labsMap[r.laboratorioId] = {
          laboratorioId: r.laboratorioId,
          laboratorioNombre: r.laboratorioNombre || 'Sin nombre',
          tipo: r.tipo || 'normal',
          ocupado: false,
          horarios: [],
        };
      }

      labsMap[r.laboratorioId].horarios.push({
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
        estado: r.estado,
        userEmail: r.userEmail,
        createdAt: r.createdAt || null,
      });

      // ✅ Tu sistema usa "confirmada" (no "aprobada")
      if (r.estado === 'confirmada' || r.estado === 'pendiente') {
        labsMap[r.laboratorioId].ocupado = true;
      }
    };

    snapDate.forEach(processDoc);
    snapString.forEach(processDoc);

    // (opcional) ordenar horarios por horaInicio
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

module.exports = { getAdminLaboratoriosEstado };
