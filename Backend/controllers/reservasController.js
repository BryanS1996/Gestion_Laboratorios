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

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;

/* =======================
   DISPONIBILIDAD
======================= */
const getAvailability = async (req, res) => {
  try {
    const { laboratorioId, fecha } = req.query;
    const day = toDateOnly(fecha);

    const snap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '==', day)
      .where('estado', 'in', ['confirmada', 'pendiente'])
      .get();

    const reservas = snap.docs.map(d => d.data());

    const slots = DEFAULT_SLOTS.map(s => ({
      ...s,
      disponible: !reservas.some(r =>
        overlaps(s.start, s.end, r.horaInicio, r.horaFin)
      ),
    }));

    res.json({ slots });
  } catch (e) {
    res.status(500).json({ error: 'Error disponibilidad' });
  }
};

/* =======================
   RESERVA BÁSICA
======================= */
const createReserva = async (req, res) => {
  const {
    laboratorioId,
    laboratorioNombre,
    fecha,
    horaInicio,
    horaFin,
    motivo,
  } = req.body;

  const reserva = {
    laboratorioId,
    laboratorioNombre,
    fecha: toDateOnly(fecha),
    horaInicio,
    horaFin,
    motivo: motivo || null,
    estado: 'confirmada',
    tipo: 'basico',
    userId: req.user.uid,
    userEmail: req.user.email,
    createdAt: new Date(),
  };

  const ref = await db.collection('reservas').add(reserva);

  await confirmacionReserva({
    userEmail: req.user.email,
    userNombre: req.user.nombre || 'Usuario',
    laboratorioNombre,
    fecha,
    horaInicio: Number(horaInicio),
    horaFin: Number(horaFin),
    reservaId: ref.id,
  }, false); // "reserva sin pago"

  res.status(201).json({ id: ref.id, ...reserva });
};
/* =======================
   MIS RESERVAS
======================= */
const getMyReservas = async (req, res) => {
  const uid = req.user.uid;
  console.log('[🔥 UID]', uid); // ✅ Verifica que el UID llega bien

  const snap = await db
    .collection('reservas')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
    console.log('[📦 Reservas encontradas]', snap.size); // ✅ ¿Cuántas reservas devuelve?

  const reservas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('[🧾 Reservas]', reservas);

  res.json({ reservas });
};
/* =======================
   STRIPE PAYMENT INTENT
======================= */
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
  const ref = db.collection('reservas').doc(req.params.id);
  await ref.update({ estado: 'cancelada' });
  res.json({ message: 'Reserva cancelada' });
};

module.exports = {
  getAvailability,
  getMyReservas,
  createReserva,
  createPremiumIntent,
  cancelReserva,
  DEFAULT_SLOTS,
};
