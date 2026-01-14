const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
  // Vinculación con el usuario de Firebase (Solo guardamos el ID)
  userId: { 
    type: String, 
    required: true,
    index: true // Crea un índice para buscar rápido los reportes de un usuario
  },
  
  // Guardamos el email para referencia rápida sin consultar Firebase Auth
  userEmail: {
    type: String,
    required: false
  },
  
  // Datos del Laboratorio (Vienen de tu frontend/Firestore)
  laboratorioId: { 
    type: String, 
    required: true 
  },
  laboratorioNombre: {
    type: String,
    required: false
  },

  // Detalles del Incidente
  titulo: {
    type: String,
    required: false,
    default: 'Reporte de incidente'
  },
  descripcion: { 
    type: String, 
    required: true 
  },
  
  // Backblaze: Aquí guardaremos la URL pública de la imagen
  imagenUrl: { 
    type: String,
    required: false
  },
  
  // Estado del reporte para gestión administrativa
  estado: {
    type: String,
    enum: ['pendiente', 'en_revision', 'resuelto', 'descartado'],
    default: 'pendiente'
  },

  // Campo flexible para guardar el JSON que nos devuelva Gemini (IA)
  // Usamos 'Mixed' porque la estructura de la IA puede variar
  analisisIA: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },

  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reporte', ReporteSchema);