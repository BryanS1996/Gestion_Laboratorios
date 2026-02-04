const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  // 🔗 Traceability with the reservation (optional)
  reservaId: {
    type: String,
    required: false,
    index: true
  },

  // User
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  // Laboratory
  laboratorioId: {
    type: String,
    required: true
  },
  laboratorioNombre: {
    type: String,
    required: true
  },

  // Report Content
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },

  // Image (Backblaze B2)
  imageKey: {
    type: String,
    default: null
  },

  // Report status
  estado: {
    type: String,
    enum: ['pendiente', 'revisado', 'resuelto'],
    default: 'pendiente'
  },

  // Date
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reporte', reporteSchema);
