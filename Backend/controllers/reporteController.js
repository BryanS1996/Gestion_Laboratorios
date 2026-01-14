const Reporte = require('../models/Reporte');

// 1. CREAR UN NUEVO REPORTE DE FALLO
const crearReporte = async (req, res) => {
  try {
    // Datos que vienen del formulario del Frontend
    const { 
      laboratorioId, 
      laboratorioNombre, 
      titulo, 
      descripcion, 
      imagenUrl // (Opcional) URL de Backblaze si ya se subió la imagen
    } = req.body;

    // Datos del usuario autenticado (inyectados por tu middleware 'verifyToken')
    // Asegúrate de que tu middleware ponga el objeto 'user' o 'uid' en req
    const { uid, email } = req.user; 

    // Validaciones básicas
    if (!laboratorioId || !descripcion) {
      return res.status(400).json({ 
        error: 'Faltan datos obligatorios (laboratorio o descripción)' 
      });
    }

    // Crear la instancia del modelo Mongoose
    const nuevoReporte = new Reporte({
      userId: uid,           // ID de Firebase (clave para relacionar)
      userEmail: email,      // Guardamos el email para referencia rápida
      laboratorioId,
      laboratorioNombre,
      titulo: titulo || 'Reporte de incidente',
      descripcion,
      imagenUrl: imagenUrl || null,
      estado: 'pendiente',   // Estado inicial por defecto
      fechaCreacion: new Date()
    });

    // Guardar en la base de datos MongoDB
    const reporteGuardado = await nuevoReporte.save();

    console.log(`📝 Nuevo reporte creado en Mongo por: ${email}`);

    res.status(201).json({
      mensaje: 'Reporte registrado exitosamente',
      reporte: reporteGuardado
    });

  } catch (error) {
    console.error('❌ Error al crear reporte:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al guardar el reporte' 
    });
  }
};

// 2. OBTENER EL HISTORIAL DE REPORTES DEL USUARIO
const obtenerMisReportes = async (req, res) => {
  try {
    const { uid } = req.user; // Obtenemos el ID del usuario logueado

    // Buscamos en Mongo todos los documentos donde userId coincida
    // .sort({ fechaCreacion: -1 }) ordena del más reciente al más antiguo
    const reportes = await Reporte.find({ userId: uid })
      .sort({ fechaCreacion: -1 });

    res.json({
      mensaje: 'Historial de reportes obtenido',
      cantidad: reportes.length,
      data: reportes
    });

  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    res.status(500).json({ 
      error: 'Error al consultar el historial de reportes' 
    });
  }
};

module.exports = {
  crearReporte,
  obtenerMisReportes
};