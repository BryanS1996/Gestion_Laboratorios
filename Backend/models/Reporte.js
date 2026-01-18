const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  reservaId: { type: String, required: true, unique: true },

  userId: { type: String, required: true },
  userEmail: { type: String, required: true },

  laboratorioId: { type: String, required: true },
  laboratorioNombre: { type: String, required: true },

  fecha: { type: String, required: true },
  horario: { type: String, required: true },

  tipoAcceso: { type: String, enum: ['basico', 'premium'], required: true },

  pago: {
    requerido: { type: Boolean, default: false },
    stripeSessionId: String,
    stripePaymentIntent: String,
    estado: { type: String, enum: ['pendiente', 'pagado'], default: 'pendiente' },
    monto: Number,
  },

  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);
