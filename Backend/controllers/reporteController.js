// Backend/controllers/reporteController.js
const Reporte = require('../models/Reporte');
const {
  uploadReportImage,
  deleteReportImage,
  getSignedReportImageUrl
} = require('../services/b2Upload.service.js');

// 1) CREAR REPORTE (con imagen opcional)
const crearReporte = async (req, res) => {
  try {
    const { laboratorioId, laboratorioNombre, titulo, descripcion } = req.body || {};
    const { uid, email } = req.user;

    if (!laboratorioId || !descripcion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: laboratorioId y/o descripcion' });
    }

    // Crear instancia del reporte (sin imagen aún)
    const nuevoReporte = new Reporte({
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre: laboratorioNombre || '',
      titulo: titulo?.trim() || 'Reporte de incidente',
      descripcion,
      imageKey: null, // se setea después si hay imagen
      estado: 'pendiente',
      fechaCreacion: new Date()
    });

    // Si se adjunta imagen
    if (req.file) {
      try {
        const { key } = await uploadReportImage({
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          userId: uid,
          reporteId: String(nuevoReporte._id),
        });

        nuevoReporte.imageKey = key; // 💾 Guarda la clave del archivo en Backblaze
      } catch (err) {
        console.error('❌ Error al subir imagen a B2:', err);
        return res.status(500).json({ error: 'Error al subir la imagen del reporte' });
      }
    }

    await nuevoReporte.save();

    console.log(`📝 Reporte creado por ${email} con ID ${nuevoReporte._id}`);
    return res.status(201).json({
      mensaje: 'Reporte registrado exitosamente',
      reporte: nuevoReporte
    });
  } catch (error) {
    console.error('❌ Error al crear reporte:', error);
    return res.status(500).json({
      error: error.message || 'Error interno al registrar el reporte'
    });
  }
};

// 2) OBTENER MIS REPORTES
const obtenerMisReportes = async (req, res) => {
  try {
    const { uid } = req.user;
    const reportes = await Reporte.find({ userId: uid }).sort({ fechaCreacion: -1 });

    return res.json({
      mensaje: 'Historial de reportes obtenido',
      cantidad: reportes.length,
      data: reportes
    });
  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    return res.status(500).json({ error: 'Error al consultar reportes del usuario' });
  }
};

// 3) ELIMINAR REPORTE + BORRAR IMAGEN DE B2
const eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    if (reporte.userId !== uid) return res.status(403).json({ error: 'No autorizado' });

    if (reporte.imageKey) {
      try {
        await deleteReportImage(reporte.imageKey);
      } catch (err) {
        console.warn('⚠️ Error al eliminar imagen en B2:', err.message);
      }
    }

    await reporte.deleteOne();
    console.log(`🗑️ Reporte eliminado: ${id} por ${uid}`);

    return res.json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar el reporte' });
  }
};

// 4) OBTENER URL FIRMADA PARA IMAGEN EN B2
const obtenerUrlImagenReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);
    console.log("📄 Buscando imagen para reporte:", id);

    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    if (reporte.userId !== uid) return res.status(403).json({ error: 'No autorizado' });
    if (!reporte.imageKey) return res.status(404).json({ error: 'Este reporte no tiene imagen asociada' });

    const signedUrl = await getSignedReportImageUrl(reporte.imageKey, 300);
    console.log("🔐 URL firmada generada:", signedUrl);

    return res.json({ url: signedUrl });
  } catch (error) {
    console.error('❌ Error generando URL firmada:', error);
    return res.status(500).json({ error: 'No se pudo generar URL' });
  }
};

module.exports = {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte
};
