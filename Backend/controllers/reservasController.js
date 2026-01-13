const admin = require('../firebaseAdmin');
const db = admin.firestore();

// Slots por defecto (puedes ajustarlos a tu institución)
const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

const toDateOnly = (yyyyMmDd) => {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

// GET /api/reservas/availability?laboratorioId=...&fecha=YYYY-MM-DD
const getAvailability = async (req, res) => {
  try {
    const { laboratorioId, fecha } = req.query;
    if (!laboratorioId || !fecha) {
      return res.status(400).json({ error: 'laboratorioId y fecha son requeridos' });
    }

    const day = toDateOnly(fecha);
    if (!day) return res.status(400).json({ error: 'Fecha inválida' });

    const reservasSnap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '==', day)
      .where('estado', 'in', ['confirmada', 'pendiente'])
      .get();

    const reservas = reservasSnap.docs.map((d) => d.data());

    const slots = DEFAULT_SLOTS.map((s) => {
      const ocupado = reservas.some((r) => overlaps(s.start, s.end, r.horaInicio, r.horaFin));
      return { ...s, disponible: !ocupado };
    });

    return res.json({ laboratorioId, fecha, slots });
  } catch (e) {
    console.error('Error disponibilidad:', e);
    return res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};

// GET /api/reservas/mine
const getMyReservas = async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db
      .collection('reservas')
      .where('userId', '==', uid)
      .orderBy('fecha', 'desc')
      .limit(100)
      .get();

    const reservas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ reservas });
  } catch (e) {
    console.error('Error mis reservas:', e);
    return res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// POST /api/reservas
const createReserva = async (req, res) => {
  try {
    const { laboratorioId, laboratorioNombre, fecha, horaInicio, horaFin, motivo } = req.body;

    if (!laboratorioId || !fecha || horaInicio == null || horaFin == null) {
      return res.status(400).json({ error: 'laboratorioId, fecha, horaInicio y horaFin son requeridos' });
    }

    const day = toDateOnly(fecha);
    if (!day) return res.status(400).json({ error: 'Fecha inválida' });

    const start = Number(horaInicio);
    const end = Number(horaFin);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      return res.status(400).json({ error: 'Rango de horas inválido' });
    }

    // Validación de rol (según tu flujo: estudiantes/profesores reservan)
    if (!['student', 'professor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Solo estudiantes o profesores pueden reservar' });
    }

    // Chequeo de solapamiento
    const reservasSnap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '==', day)
      .where('estado', 'in', ['confirmada', 'pendiente'])
      .get();

    const ocupado = reservasSnap.docs.some((d) => {
      const r = d.data();
      return overlaps(start, end, r.horaInicio, r.horaFin);
    });

    if (ocupado) {
      return res.status(409).json({ error: 'Horario ocupado' });
    }

    const reserva = {
      laboratorioId,
      laboratorioNombre: laboratorioNombre || null,
      fecha: day,
      horaInicio: start,
      horaFin: end,
      motivo: motivo || null,
      estado: 'confirmada',
      userId: req.user.uid,
      userEmail: req.user.email,
      userNombre: req.user.displayName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await db.collection('reservas').add(reserva);
    return res.status(201).json({ id: ref.id, ...reserva });
  } catch (e) {
    console.error('Error creando reserva:', e);
    return res.status(500).json({ error: 'Error al crear reserva' });
  }
};

// PATCH /api/reservas/:id/cancel
const cancelReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user.uid;
    const role = req.user.role;

    const ref = db.collection('reservas').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Reserva no encontrada' });

    const data = doc.data();
    // Solo dueño o admin puede cancelar
    if (role !== 'admin' && data.userId !== uid) {
      return res.status(403).json({ error: 'No puedes cancelar esta reserva' });
    }

    await ref.update({ estado: 'cancelada', updatedAt: new Date() });
    return res.json({ message: 'Reserva cancelada' });
  } catch (e) {
    console.error('Error cancelando reserva:', e);
    return res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};

module.exports = {
  getAvailability,
  getMyReservas,
  createReserva,
  cancelReserva,
  DEFAULT_SLOTS,
};
