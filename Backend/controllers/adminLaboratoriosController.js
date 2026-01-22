const admin = require('../firebaseAdmin');
const db = admin.firestore();

const getAdminLaboratoriosEstado = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }

    const snapshot = await db
      .collection('reservas')
      .where('fecha', '==', fecha)
      .get();

    const labsMap = {};

    snapshot.forEach(doc => {
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
      });

      if (r.estado === 'confirmada') {
        labsMap[r.laboratorioId].ocupado = true;
      }
    });

    res.json({
      fecha,
      laboratorios: Object.values(labsMap),
    });
  } catch (error) {
    console.error('[getAdminLaboratoriosEstado]', error);
    res.status(500).json({ error: 'Error obteniendo estado de laboratorios' });
  }
};

module.exports = {
  getAdminLaboratoriosEstado,
};
