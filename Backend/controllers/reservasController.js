const logger = require('../config/reservation.logger');

const admin = require('../firebaseAdmin');
const db = admin.firestore();
const Stripe = require('stripe');
const { confirmacionReserva } = require('../services/mailer');
const { DateTime } = require('luxon');

const ZONE = 'America/Guayaquil';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =======================
   HELPERS
======================= */

// Default time slots for reservations
const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

// Get start and end range for a given ISO date
const dayRange = (isoDate) => {
  const start = DateTime.fromISO(String(isoDate), { zone: ZONE }).startOf('day');
  if (!start.isValid) return null;
  const end = start.plus({ days: 1 });
  return { start: start.toJSDate(), end: end.toJSDate() };
};

// Normalize user role
const normalizeRole = (role) => (role || 'student').toLowerCase();

// Check overlapping time ranges
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/* =======================
   AVAILABILITY
======================= */

const getAvailability = async (req, res, next) => {
  try {
    const { laboratorioId, fecha } = req.query;

    // Log availability request
    logger.info(
      `Availability request | user=${req.user?.uid} lab=${laboratorioId} date=${fecha}`,
      { requestId: req.requestId }
    );

    if (!laboratorioId || !fecha) {
      return res.status(400).json({ error: 'laboratorioId y fecha son requeridos' });
    }

    const range = dayRange(fecha);
    if (!range) return res.status(400).json({ error: 'Fecha inválida' });

    const role = normalizeRole(req.user?.role);

    const snap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '>=', range.start)
      .where('fecha', '<', range.end)
      .get();

    const reservas = snap.docs
      .map((d) => d.data())
      .filter((r) => ['confirmada', 'pendiente'].includes(r.estado));

    // Log active reservations count
    logger.info(
      `Availability evaluated | lab=${laboratorioId} activeReservations=${reservas.length}`,
      { requestId: req.requestId }
    );

    const slots = DEFAULT_SLOTS.map((s) => {
      const conflictos = reservas.filter((r) =>
        overlaps(s.start, s.end, Number(r.horaInicio), Number(r.horaFin))
      );

      const ocupadoPorProfesor = conflictos.some(
        (r) => normalizeRole(r.userRole) === 'professor'
      );

      const disponible =
        role === 'professor' ? !ocupadoPorProfesor : conflictos.length === 0;

      return {
        ...s,
        disponible,
        ocupadoPorProfesor,
        ocupadoPorEstudiante: conflictos.some(
          (r) => normalizeRole(r.userRole) !== 'professor'
        ),
      };
    });

    return res.json({ slots });
  } catch (error) {
    next(error);
  }
};

/* =======================
   CREATE RESERVATION
======================= */

const createReserva = async (req, res, next) => {
  try {
    const { laboratorioId, laboratorioNombre, fecha, horaInicio, horaFin, motivo } = req.body;
    const userId = req.user.uid;
    const role = normalizeRole(req.user.role);

    // Log reservation attempt
    logger.info(
      `Reservation attempt | user=${userId} role=${role} lab=${laboratorioId} date=${fecha} time=${horaInicio}-${horaFin}`,
      { requestId: req.requestId }
    );

    if (!laboratorioId || !laboratorioNombre || !fecha || horaInicio == null || horaFin == null) {
      return res.status(400).json({ error: 'Faltan datos para la reserva' });
    }

    const range = dayRange(fecha);
    if (!range) return res.status(400).json({ error: 'Fecha inválida' });

    const isProfessor = role === 'professor';

    const reservaNueva = {
      laboratorioId,
      laboratorioNombre,
      fecha: range.start,
      horaInicio: Number(horaInicio),
      horaFin: Number(horaFin),
      motivo: motivo || null,
      estado: 'confirmada',
      tipo: 'basico',
      userId,
      userEmail: req.user.email,
      userRole: role,
      createdAt: new Date(),
    };

    const txResult = await db.runTransaction(async (tx) => {
      const q = db.collection('reservas')
        .where('laboratorioId', '==', laboratorioId)
        .where('fecha', '>=', range.start)
        .where('fecha', '<', range.end);

      const snap = await tx.get(q);

      const activas = snap.docs
        .map(d => ({ id: d.id, ref: d.ref, ...d.data() }))
        .filter(r => ['confirmada', 'pendiente'].includes(r.estado));

      const conflictivas = activas.filter(r =>
        overlaps(
          reservaNueva.horaInicio,
          reservaNueva.horaFin,
          Number(r.horaInicio),
          Number(r.horaFin)
        )
      );

      if (conflictivas.length === 0) {
        const newRef = db.collection('reservas').doc();
        tx.set(newRef, reservaNueva);
        return { id: newRef.id };
      }

      // Log reservation conflict
      logger.warn(
        `Reservation conflict | user=${userId} lab=${laboratorioId} conflicts=${conflictivas.length}`,
        { requestId: req.requestId }
      );

      if (!isProfessor) {
        throw new Error('Horario no disponible. Ya existe una reserva en este bloque.');
      }

      const hayProfesor = conflictivas.some(
        r => normalizeRole(r.userRole) === 'professor'
      );

      if (hayProfesor) {
        throw new Error('Horario no disponible. Ya existe una reserva de otro profesor.');
      }

      // Log priority cancellation of student reservations
      logger.warn(
        `Reservation priority override | professor=${userId} cancelled=${conflictivas.length}`,
        { requestId: req.requestId }
      );

      conflictivas.forEach(r => {
        tx.update(r.ref, {
          estado: 'cancelada_por_prioridad',
          cancelledAt: new Date()
        });
      });

      const newRef = db.collection('reservas').doc();
      tx.set(newRef, reservaNueva);
      return { id: newRef.id };
    });

    // Log successful reservation creation
    logger.info(
      `Reservation created | reservationId=${txResult.id} user=${userId} lab=${laboratorioId}`,
      { requestId: req.requestId }
    );

    await confirmacionReserva({
      userEmail: req.user.email,
      userNombre: req.user.nombre || req.user.displayName || 'Usuario',
      laboratorioNombre,
      fecha,
      horaInicio: reservaNueva.horaInicio,
      horaFin: reservaNueva.horaFin,
      reservaId: txResult.id,
    }, false);

    return res.status(201).json({ id: txResult.id, ...reservaNueva });

  } catch (error) {
    next(error);
  }
};

/* =======================
   OTHER FUNCTIONS
======================= */

const getMyReservas = async (req, res, next) => {
  try {
    const snap = await db.collection('reservas')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const reservas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ reservas });
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const snapshot = await db.collection('reservas').get();

    const reservas = snapshot.docs.map(doc => {
      const data = doc.data();
      let f = 'Sin fecha';
      if (data.fecha?.toDate) f = data.fecha.toDate().toISOString().split('T')[0];
      else if (data.fecha?._seconds) {
        f = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      }
      return { id: doc.id, ...data, fecha: f };
    });

    res.status(200).json({ reservas });
  } catch (error) {
    next(error);
  }
};

const createPremiumIntent = async (req, res, next) => {
  try {
    const { laboratorioId, laboratorioNombre, fecha, horaInicio, horaFin, precio } = req.body;

    const reservaRef = await db.collection('reservas').add({
      laboratorioId,
      laboratorioNombre,
      fecha: dayRange(fecha).start,
      horaInicio,
      horaFin,
      estado: 'pendiente',
      tipo: 'premium',
      userId: req.user.uid,
      userEmail: req.user.email,
      userRole: normalizeRole(req.user?.role),
      createdAt: new Date(),
    });

    const intent = await stripe.paymentIntents.create({
      amount: precio * 100,
      currency: 'usd',
      metadata: { reservaId: reservaRef.id, userId: req.user.uid },
    });

    res.json({ clientSecret: intent.client_secret, reservaId: reservaRef.id });
  } catch (error) {
    next(error);
  }
};

const cancelReserva = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const role = normalizeRole(req.user.role);
    const reservaId = req.params.id;

    // Log reservation cancellation attempt
    logger.info(
      `Reservation cancellation attempt | reservationId=${reservaId} user=${userId} role=${role}`,
      { requestId: req.requestId }
    );

    const ref = db.collection('reservas').doc(reservaId);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'No existe' });
    }

    const data = doc.data();
    if (data.userId !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await ref.update({ estado: 'cancelada', cancelledAt: new Date() });

    // Log successful reservation cancellation
    logger.info(
      `Reservation cancelled | reservationId=${reservaId} cancelledBy=${userId}`,
      { requestId: req.requestId }
    );

    res.json({ message: 'Cancelada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  getMyReservas,
  getAllReservations,
  createReserva,
  createPremiumIntent,
  cancelReserva,
  DEFAULT_SLOTS,
};