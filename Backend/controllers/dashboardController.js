const admin = require('../firebaseAdmin');
const db = admin.firestore();

// 📊 Obtener estadísticas generales del dashboard
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Contar reservas de hoy
    const reservasSnapshot = await db.collection('reservas')
      .where('fecha', '>=', today)
      .where('fecha', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000))
      .get();

    const totalReservas = reservasSnapshot.size;

    // 2. Obtener laboratorios y contar ocupados ahora
    const laboratoriosSnapshot = await db.collection('laboratorios').get();
    const totalLaboratorios = laboratoriosSnapshot.size;

    let ocupados = 0;
    const ahora = new Date();
    
    for (const doc of laboratoriosSnapshot.docs) {
      const reservasActuales = await db.collection('reservas')
        .where('laboratorioId', '==', doc.id)
        .where('fecha', '==', today)
        .get();

      for (const res of reservasActuales.docs) {
        const data = res.data();
        if (data.horaInicio <= ahora.getHours() && data.horaFin > ahora.getHours()) {
          ocupados++;
          break;
        }
      }
    }

    // 3. Contar reportes pendientes
    const reportesSnapshot = await db.collection('reportes')
      .where('estado', '==', 'pendiente')
      .get();

    const reportesPendientes = reportesSnapshot.size;

    res.status(200).json({
      stats: {
        reservasHoy: totalReservas,
        laboratoriosOcupados: `${ocupados}/${totalLaboratorios}`,
        reportesPendientes: reportesPendientes
      }
    });
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// 📅 Obtener disponibilidad de laboratorios por horarios
const getDisponibilidad = async (req, res) => {
  try {
    const fecha = req.query.fecha ? new Date(req.query.fecha) : new Date();
    fecha.setHours(0, 0, 0, 0);

    const laboratoriosSnapshot = await db.collection('laboratorios').get();
    const horarios = ['07:00', '09:00', '11:00', '14:00', '16:00'];

    const disponibilidad = [];

    for (const labDoc of laboratoriosSnapshot.docs) {
      const labData = labDoc.data();
      const slots = [];

      // Para cada horario, verificar si hay reserva
      for (let i = 0; i < horarios.length; i++) {
        const horaInicio = parseInt(horarios[i].split(':')[0]);
        const horaFin = i < horarios.length - 1 ? parseInt(horarios[i + 1].split(':')[0]) : horaInicio + 2;

        const reservasSnapshot = await db.collection('reservas')
          .where('laboratorioId', '==', labDoc.id)
          .where('fecha', '==', fecha)
          .get();

        let disponible = true;
        for (const resDoc of reservasSnapshot.docs) {
          const resData = resDoc.data();
          if (resData.horaInicio < horaFin && resData.horaFin > horaInicio) {
            disponible = false;
            break;
          }
        }

        slots.push(disponible ? 'libre' : 'ocupado');
      }

      disponibilidad.push({
        id: labDoc.id,
        nombre: labData.nombre || `Laboratorio ${labDoc.id}`,
        slots: slots
      });
    }

    res.status(200).json({
      fecha: fecha.toISOString().split('T')[0],
      horarios: horarios,
      laboratorios: disponibilidad
    });
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};

// 📋 Obtener todas las reservas (con filtros opcionales)
const getReservas = async (req, res) => {
  try {
    const { laboratorioId, estado, limite = 10 } = req.query;

    let query = db.collection('reservas');

    if (laboratorioId) {
      query = query.where('laboratorioId', '==', laboratorioId);
    }

    if (estado) {
      query = query.where('estado', '==', estado);
    }

    query = query.orderBy('fecha', 'desc').limit(parseInt(limite));

    const snapshot = await query.get();
    const reservas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ reservas });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// 🔧 Obtener reportes pendientes
const getReportes = async (req, res) => {
  try {
    const { estado = 'pendiente', limite = 10 } = req.query;

    // ⚠️ Firestore puede requerir un índice compuesto para (where estado + orderBy createdAt).
    // Para que el dashboard no "reviente" en proyectos nuevos (sin índices / sin createdAt),
    // intentamos primero con orderBy y si falla, hacemos fallback sin orderBy.
    let snapshot;
    try {
      snapshot = await db.collection('reportes')
        .where('estado', '==', estado)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limite))
        .get();
    } catch (err) {
      console.warn('Fallback getReportes sin orderBy (probable índice faltante):', err?.message);
      snapshot = await db.collection('reportes')
        .where('estado', '==', estado)
        .limit(parseInt(limite))
        .get();
    }

    const reportes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ reportes });
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

// 👥 Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const { role, limite = 50 } = req.query;

    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    query = query.orderBy('createdAt', 'desc').limit(parseInt(limite));

    const snapshot = await query.get();
    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      uid: doc.data().uid,
      email: doc.data().email,
      displayName: doc.data().displayName,
      role: doc.data().role,
      createdAt: doc.data().createdAt
    }));

    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

module.exports = { getStats, getDisponibilidad, getReservas, getReportes, getUsuarios };
