const admin = require('../firebaseAdmin');
const db = admin.firestore();
const Stripe = require('stripe');
const { confirmacionReserva } = require('../services/mailer');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =======================
   SLOTS
======================= */
const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

const toDateOnly = (d) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeRole = (role) => (role || 'student').toLowerCase();

const toHourNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};


const overlaps = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;

/* =======================
   DISPONIBILIDAD
======================= */
const getAvailability = async (req, res) => {
  try {
    const { laboratorioId, fecha } = req.query;
    const day = toDateOnly(fecha);
    if (!laboratorioId || !day) {
      return res.status(400).json({ error: 'laboratorioId y fecha son requeridos' });
    }

    const role = normalizeRole(req.user?.role);

    const snap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '==', day)
      .where('estado', 'in', ['confirmada', 'pendiente'])
      .get();

    const reservas = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const slots = DEFAULT_SLOTS.map(s => {
      const conflictos = reservas.filter(r =>
        overlaps(s.start, s.end, Number(r.horaInicio), Number(r.horaFin))
      );

      const ocupadoPorProfesor = conflictos.some(r => normalizeRole(r.userRole) === 'professor');
      const ocupadoPorEstudiante = conflictos.some(r => normalizeRole(r.userRole) !== 'professor');

      // Reglas:
      // - student: NO disponible si hay cualquier conflicto
      // - professor: solo NO disponible si hay conflicto con otro profesor
      const disponible = role === 'professor'
        ? !ocupadoPorProfesor
        : conflictos.length === 0;

      return {
        ...s,
        disponible,
        ocupadoPorProfesor,
        ocupadoPorEstudiante,
      };
    });

    res.json({ slots });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error disponibilidad' });
  }
};

/* =======================
   RESERVA BÁSICA
======================= */
const createReserva = async (req, res) => {
  console.log('ROLE =>', req.user?.role, 'UID =>', req.user?.uid);
  try {
    const {
      laboratorioId,
      laboratorioNombre,
      fecha,
      horaInicio,
      horaFin,
      motivo,
    } = req.body;

    const day = toDateOnly(fecha);
    const hIni = toHourNumber(horaInicio);
    const hFin = toHourNumber(horaFin);

    if (!laboratorioId || !laboratorioNombre || !day || hIni == null || hFin == null) {
      return res.status(400).json({ error: 'Datos de reserva inválidos' });
    }
    if (hIni >= hFin) {
      return res.status(400).json({ error: 'horaInicio debe ser menor que horaFin' });
    }

    const role = normalizeRole(req.user?.role);

    const reservaBase = {
      laboratorioId,
      laboratorioNombre,
      fecha: day,
      horaInicio: hIni,
      horaFin: hFin,
      motivo: motivo || null,
      estado: 'confirmada',
      tipo: 'basico',
      userId: req.user.uid,
      userEmail: req.user.email,
      userRole: role, // ✅ clave para prioridad y disponibilidad
      createdAt: new Date(),
    };

    const txResult = await db.runTransaction(async (tx) => {
      const q = db.collection('reservas')
        .where('laboratorioId', '==', laboratorioId)
        .where('fecha', '==', day)
        .where('estado', 'in', ['confirmada', 'pendiente']);

      const snap = await tx.get(q);

      const conflictos = snap.docs
        .map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }))
        .filter(r => overlaps(hIni, hFin, Number(r.horaInicio), Number(r.horaFin)));

      if (conflictos.length === 0) {
        const newRef = db.collection('reservas').doc();
        tx.set(newRef, reservaBase);
        return { createdId: newRef.id, cancelledIds: [] };
      }

      // 1) Student (u otro rol) => si hay conflicto, se rechaza
      if (role !== 'professor') {
        const err = new Error('Horario no disponible');
        err.status = 409;
        throw err;
      }

      // 2) Professor => si hay otro professor en conflicto, se rechaza
      const hayProfesor = conflictos.some(r => normalizeRole(r.userRole) === 'professor');
      if (hayProfesor) {
        const err = new Error('Ya existe una reserva de profesor en ese horario');
        err.status = 409;
        throw err;
      }

      // 3) Professor vs Students => cancelar estudiantes y crear reserva profesor
      const cancelledIds = [];
      for (const r of conflictos) {
        tx.update(r.ref, {
          estado: 'cancelada_por_prioridad',
          cancelledAt: new Date(),
          cancelledByRole: 'professor',
        });
        cancelledIds.push(r.id);
      }

      const newRef = db.collection('reservas').doc();
      tx.set(newRef, reservaBase);

      return { createdId: newRef.id, cancelledIds };
    });

    // Email confirmación al que reservó
    await confirmacionReserva({
      userEmail: req.user.email,
      userNombre: req.user.nombre || 'Usuario',
      laboratorioNombre,
      fecha,
      horaInicio: hIni,
      horaFin: hFin,
      reservaId: txResult.createdId,
    }, false);

    // (Opcional) aquí podrías notificar a estudiantes cancelados por prioridad
    // txResult.cancelledIds -> ids canceladas

    res.status(201).json({ id: txResult.createdId, ...reservaBase, cancelled: txResult.cancelledIds });
  } catch (e) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message || 'Error creando reserva' });
  }
};

/* =======================
   MIS RESERVAS
======================= */
const getMyReservas = async (req, res) => {
  const uid = req.user.uid;
  console.log('[🔥 UID]', uid);

  const snap = await db
    .collection('reservas')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  
  console.log('[📦 Reservas encontradas]', snap.size);

  const reservas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  res.json({ reservas });
};

/* =======================
   ✅ OBTENER TODAS LAS RESERVAS (CATÁLOGO)
   Corrige el formato de fecha para el frontend
======================= */
const getAllReservations = async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = db.collection('reservas');

    // Opcional: Filtrar en BD si viene fecha
    if (fecha) {
        const day = toDateOnly(fecha);
        if (day) query = query.where('fecha', '==', day);
    }

    const snapshot = await query.get();
    
    const reservas = snapshot.docs.map(doc => {
      const data = doc.data();
      let fechaLimpia = "Sin fecha";
      if (data.fecha?.toDate) {
        fechaLimpia = data.fecha.toDate().toISOString().split('T')[0];
      } else if (data.fecha?._seconds) {
        fechaLimpia = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      } else if (typeof data.fecha === 'string') {
        fechaLimpia = data.fecha.split('T')[0];
      }

      return {
        id: doc.id, 
        ...data,
        fecha: fechaLimpia // Enviamos la fecha ya como string limpio
      };
    });

    res.status(200).json({ reservas });
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).json({ error: 'Error al obtener reservas del sistema' });
  }
};

/* =======================
   STRIPE PAYMENT INTENT
======================= */
const createPremiumIntent = async (req, res) => {
  const {
    laboratorioId,
    laboratorioNombre,
    fecha,
    horaInicio,
    horaFin,
    precio,
  } = req.body;

  const reservaRef = await db.collection('reservas').add({
    laboratorioId,
    laboratorioNombre,
    fecha: toDateOnly(fecha),
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
    metadata: {
      reservaId: reservaRef.id,
      userId: req.user.uid,
      laboratorioId,
    },
  });

  res.json({
    clientSecret: intent.client_secret,
    reservaId: reservaRef.id,
  });
};

/* =======================
   CANCELAR
======================= */
const cancelReserva = async (req, res) => {
  try {
    const ref = db.collection('reservas').doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: 'Reserva no encontrada' });

    const data = doc.data();
    const role = normalizeRole(req.user?.role);

    const esDuenio = data.userId === req.user.uid;
    const esAdmin = role === 'admin';

    if (!esDuenio && !esAdmin) {
      return res.status(403).json({ error: 'No autorizado para cancelar esta reserva' });
    }

    await ref.update({ estado: 'cancelada', cancelledAt: new Date(), cancelledBy: req.user.uid });
    res.json({ message: 'Reserva cancelada' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error cancelando reserva' });
  }
};


module.exports = {
  getAvailability,
  getMyReservas,
  getAllReservations, // ✅ Asegúrate que esto esté aquí
  createReserva,
  createPremiumIntent,
  cancelReserva,
  DEFAULT_SLOTS,
};