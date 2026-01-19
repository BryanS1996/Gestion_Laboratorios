// Backend/models/Reporte.js
const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  // 🔗 Trazabilidad con la reserva (opcional)
  reservaId: {
    type: String,
    required: false,
    index: true
  },

  // Usuario
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  // Laboratorio
  laboratorioId: {
    type: String,
    required: true
  },
  laboratorioNombre: {
    type: String,
    required: true
  },

  // Contenido del reporte
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },

  // Imagen (Backblaze B2)
  imageKey: {
    type: String,
    default: null
  },

  // Estado del reporte
  estado: {
    type: String,
    enum: ['pendiente', 'revisado', 'resuelto'],
    default: 'pendiente'
  },

  // Fecha
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reporte', reporteSchema);
