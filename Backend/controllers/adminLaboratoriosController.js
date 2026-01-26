const admin = require('../firebaseAdmin');
const db = admin.firestore();
const { DateTime } = require('luxon');

const ZONE = 'America/Guayaquil';

const getAdminLaboratoriosEstado = async (req, res) => {
  try {
    const { fecha } = req.query; // "YYYY-MM-DD"
    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    // 1) Rango del día en zona Ecuador
    const startDT = DateTime.fromISO(String(fecha), { zone: ZONE }).startOf('day');
    if (!startDT.isValid) return res.status(400).json({ error: 'Fecha inválida' });
    const endDT = startDT.plus({ days: 1 });

    const start = startDT.toJSDate();
    const end = endDT.toJSDate();

    // 2) Cargar TODOS los laboratorios (para que se muestren aunque no tengan reservas)
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

    // 3) Traer reservas del día por rango (evita el bug de fecha string vs timestamp)
    //    Esto NO requiere índice compuesto (solo rango sobre un campo).
    const reservasSnap = await db
      .collection('reservas')
      .where('fecha', '>=', start)
      .where('fecha', '<', end)
      .get();

    reservasSnap.forEach((doc) => {
      const r = doc.data() || {};
      if (!r.laboratorioId) return;

      // Si el lab no existe en colección, lo creamos “fallback”
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

      // Guardamos el horario
      labsMap[r.laboratorioId].horarios.push({
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
        estado: r.estado,
        userEmail: r.userEmail,
        createdAt: r.createdAt || null,
      });

      // Ocupado si hay al menos una reserva activa
      if (r.estado === 'confirmada' || r.estado === 'pendiente') {
        labsMap[r.laboratorioId].ocupado = true;
      }
    });

    // 4) Ordenar horarios por horaInicio
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
