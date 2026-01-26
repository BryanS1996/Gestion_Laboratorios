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
const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

const dayRange = (isoDate) => {
  const start = DateTime.fromISO(String(isoDate), { zone: ZONE }).startOf('day');
  if (!start.isValid) return null;
  const end = start.plus({ days: 1 });
  return { start: start.toJSDate(), end: end.toJSDate() };
};

const normalizeRole = (role) => (role || 'student').toLowerCase();
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/* =======================
   DISPONIBILIDAD
======================= */
const getAvailability = async (req, res) => {
  try {
    const { laboratorioId, fecha } = req.query;
    if (!laboratorioId || !fecha) {
      return res.status(400).json({ error: 'laboratorioId y fecha son requeridos' });
    }

    const range = dayRange(fecha);
    if (!range) return res.status(400).json({ error: 'Fecha inválida' });

    const role = normalizeRole(req.user?.role);

    // Consulta simplificada para evitar índices compuestos pesados
    const snap = await db
      .collection('reservas')
      .where('laboratorioId', '==', laboratorioId)
      .where('fecha', '>=', range.start)
      .where('fecha', '<', range.end)
      .get();

    // Filtramos estados en memoria (JS)
    const reservas = snap.docs
      .map((d) => d.data())
      .filter((r) => ['confirmada', 'pendiente'].includes(r.estado));

    const slots = DEFAULT_SLOTS.map((s) => {
      const conflictos = reservas.filter((r) =>
        overlaps(s.start, s.end, Number(r.horaInicio), Number(r.horaFin))
      );

      const ocupadoPorProfesor = conflictos.some((r) => normalizeRole(r.userRole) === 'professor');
      
      // Profesor puede reservar si no hay otro profesor. Estudiante solo si está vacío.
      const disponible = (role === 'professor') 
        ? !ocupadoPorProfesor 
        : conflictos.length === 0;

      return {
        ...s,
        disponible,
        ocupadoPorProfesor,
        ocupadoPorEstudiante: conflictos.some((r) => normalizeRole(r.userRole) !== 'professor'),
      };
    });

    return res.json({ slots });
  } catch (e) {
    console.error('[getAvailability] ERROR =>', e);
    return res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};

/* =======================
   CREAR RESERVA (CON PRIORIDAD)
======================= */
const createReserva = async (req, res) => {
  try {
    const { laboratorioId, laboratorioNombre, fecha, horaInicio, horaFin, motivo } = req.body;

    if (!laboratorioId || !laboratorioNombre || !fecha || horaInicio == null || horaFin == null) {
      return res.status(400).json({ error: 'Faltan datos para la reserva' });
    }

    const range = dayRange(fecha);
    if (!range) return res.status(400).json({ error: 'Fecha inválida' });

    const requesterRole = normalizeRole(req.user.role);
    const isProfessor = requesterRole === 'professor';

    const reservaNueva = {
      laboratorioId,
      laboratorioNombre,
      fecha: range.start, // Guardamos el inicio del día (Date object)
      horaInicio: Number(horaInicio),
      horaFin: Number(horaFin),
      motivo: motivo || null,
      estado: 'confirmada',
      tipo: 'basico',
      userId: req.user.uid,
      userEmail: req.user.email,
      userRole: requesterRole,
      createdAt: new Date(),
    };

    const txResult = await db.runTransaction(async (tx) => {
      const q = db.collection('reservas')
        .where('laboratorioId', '==', laboratorioId)
        .where('fecha', '>=', range.start)
        .where('fecha', '<', range.end);

      const snap = await tx.get(q);

      // Filtrar activas y detectar traslapes
      const activas = snap.docs
        .map(d => ({ id: d.id, ref: d.ref, ...d.data() }))
        .filter(r => ['confirmada', 'pendiente'].includes(r.estado));

      const conflictivas = activas.filter(r =>
        overlaps(reservaNueva.horaInicio, reservaNueva.horaFin, Number(r.horaInicio), Number(r.horaFin))
      );

      if (conflictivas.length === 0) {
        const newRef = db.collection('reservas').doc();
        tx.set(newRef, reservaNueva);
        return { id: newRef.id };
      }

      // Lógica de Prioridad
      if (!isProfessor) {
        throw new Error('Horario no disponible. Ya existe una reserva en este bloque.');
      }

      const hayProfesor = conflictivas.some(r => normalizeRole(r.userRole) === 'professor');
      if (hayProfesor) {
        throw new Error('Horario no disponible. Ya existe una reserva de otro profesor.');
      }

      // Si llegamos aquí, es profesor y solo hay estudiantes: Cancelamos estudiantes
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

  } catch (e) {
    console.error('[createReserva] ERROR =>', e);
    return res.status(400).json({ error: e.message || 'Error creando reserva' });
  }
};

/* =======================
   OTRAS FUNCIONES (SIN CAMBIOS ESTRUCTURALES)
======================= */
const getMyReservas = async (req, res) => {
  try {
    const snap = await db.collection('reservas')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc').get();
    const reservas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ reservas });
  } catch (e) { res.status(500).json({ error: 'Error al obtener mis reservas' }); }
};

const getAllReservations = async (req, res) => {
  try {
    const snapshot = await db.collection('reservas').get();
    const reservas = snapshot.docs.map(doc => {
      const data = doc.data();
      let f = "Sin fecha";
      if (data.fecha?.toDate) f = data.fecha.toDate().toISOString().split('T')[0];
      else if (data.fecha?._seconds) f = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      return { id: doc.id, ...data, fecha: f };
    });
    res.status(200).json({ reservas });
  } catch (e) { res.status(500).json({ error: 'Error al obtener catálogo' }); }
};

const createPremiumIntent = async (req, res) => {
  try {
    const { laboratorioId, laboratorioNombre, fecha, horaInicio, horaFin, precio } = req.body;
    const reservaRef = await db.collection('reservas').add({
      laboratorioId, laboratorioNombre, fecha: dayRange(fecha).start,
      horaInicio, horaFin, estado: 'pendiente', tipo: 'premium',
      userId: req.user.uid, userEmail: req.user.email,
      userRole: normalizeRole(req.user?.role), createdAt: new Date(),
    });

    const intent = await stripe.paymentIntents.create({
      amount: precio * 100,
      currency: 'usd',
      metadata: { reservaId: reservaRef.id, userId: req.user.uid },
    });
    res.json({ clientSecret: intent.client_secret, reservaId: reservaRef.id });
  } catch (e) { res.status(500).json({ error: 'Error en pago' }); }
};

const cancelReserva = async (req, res) => {
  try {
    const ref = db.collection('reservas').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'No existe' });
    const data = doc.data();
    if (data.userId !== req.user.uid && normalizeRole(req.user.role) !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    await ref.update({ estado: 'cancelada', cancelledAt: new Date() });
    res.json({ message: 'Cancelada' });
  } catch (e) { res.status(500).json({ error: 'Error al cancelar' }); }
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