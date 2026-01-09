const admin = require('../firebaseAdmin');
const db = admin.firestore();

// Utilidades compartidas
const toDateOnly = (yyyyMmDd) => {
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

// GET /api/admin/reservas?estado=&fecha=YYYY-MM-DD&laboratorioId=&userEmail=&limit=100
const listReservas = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const { estado, fecha, laboratorioId, userEmail } = req.query;

    let q = db.collection('reservas');

    if (estado) q = q.where('estado', '==', estado);
    if (laboratorioId) q = q.where('laboratorioId', '==', laboratorioId);
    if (userEmail) q = q.where('userEmail', '==', userEmail);
    if (fecha) {
      const day = toDateOnly(fecha);
      if (!day) return res.status(400).json({ error: 'Fecha inválida' });
      q = q.where('fecha', '==', day);
    }

    // Intentar ordenar por createdAt si existe índice, si no, devolver sin order
    let snap;
    try {
      snap = await q.orderBy('createdAt', 'desc').limit(limit).get();
    } catch (e) {
      snap = await q.limit(limit).get();
    }

    const reservas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ reservas });
  } catch (e) {
    console.error('Admin listReservas error:', e);
    return res.status(500).json({ error: 'Error al listar reservas' });
  }
};

// PATCH /api/admin/reservas/:id
// body opcional: estado, fecha (YYYY-MM-DD), horaInicio, horaFin, laboratorioId, laboratorioNombre, motivo
const updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('reservas').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Reserva no encontrada' });

    const current = doc.data();
    const patch = {};

    const {
      estado,
      fecha,
      horaInicio,
      horaFin,
      laboratorioId,
      laboratorioNombre,
      motivo,
    } = req.body;

    if (estado) patch.estado = estado;
    if (motivo !== undefined) patch.motivo = motivo;
    if (laboratorioNombre !== undefined) patch.laboratorioNombre = laboratorioNombre;

    // Cambios de fecha/horario/lab requieren revalidar solapamiento
    let newFecha = current.fecha;
    let newLabId = current.laboratorioId;
    let newStart = current.horaInicio;
    let newEnd = current.horaFin;

    if (laboratorioId) {
      newLabId = laboratorioId;
      patch.laboratorioId = laboratorioId;
    }

    if (fecha) {
      const day = toDateOnly(fecha);
      if (!day) return res.status(400).json({ error: 'Fecha inválida' });
      newFecha = day;
      patch.fecha = day;
    }

    if (horaInicio != null) {
      const v = Number(horaInicio);
      if (!Number.isFinite(v)) return res.status(400).json({ error: 'horaInicio inválida' });
      newStart = v;
      patch.horaInicio = v;
    }
    if (horaFin != null) {
      const v = Number(horaFin);
      if (!Number.isFinite(v)) return res.status(400).json({ error: 'horaFin inválida' });
      newEnd = v;
      patch.horaFin = v;
    }

    if (newStart >= newEnd) {
      return res.status(400).json({ error: 'Rango de horas inválido' });
    }

    // Solo validar si cambió algo que afecte disponibilidad
    const needsCheck = Boolean(laboratorioId || fecha || horaInicio != null || horaFin != null);
    if (needsCheck && (patch.estado ? ['confirmada', 'pendiente'].includes(patch.estado) : ['confirmada', 'pendiente'].includes(current.estado))) {
      const snap = await db
        .collection('reservas')
        .where('laboratorioId', '==', newLabId)
        .where('fecha', '==', newFecha)
        .where('estado', 'in', ['confirmada', 'pendiente'])
        .get();

      const ocupado = snap.docs.some((d) => {
        if (d.id === id) return false;
        const r = d.data();
        return overlaps(newStart, newEnd, r.horaInicio, r.horaFin);
      });

      if (ocupado) return res.status(409).json({ error: 'Horario ocupado' });
    }

    patch.updatedAt = new Date();
    await ref.update(patch);

    const updated = (await ref.get()).data();
    return res.json({ id, ...updated });
  } catch (e) {
    console.error('Admin updateReserva error:', e);
    return res.status(500).json({ error: 'Error al actualizar reserva' });
  }
};

// DELETE /api/admin/reservas/:id
const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('reservas').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Reserva no encontrada' });

    await ref.delete();
    return res.json({ message: 'Reserva eliminada' });
  } catch (e) {
    console.error('Admin deleteReserva error:', e);
    return res.status(500).json({ error: 'Error al eliminar reserva' });
  }
};

module.exports = { listReservas, updateReserva, deleteReserva };
