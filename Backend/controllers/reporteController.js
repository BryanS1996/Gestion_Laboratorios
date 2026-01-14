const Reporte = require('../models/Reporte');
const {
  uploadReportImage,
  deleteReportImage,
  getSignedReportImageUrl
} = require('../services/b2Upload.service');

// 1. CREAR UN NUEVO REPORTE DE FALLO
const crearReporte = async (req, res) => {
  try {
    const {
      laboratorioId,
      laboratorioNombre,
      titulo,
      descripcion,
      imagenUrl // opcional si el front ya manda URL (normalmente no lo usas ahora)
    } = req.body;

    const { uid, email } = req.user;

    if (!laboratorioId || !descripcion) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios (laboratorio o descripción)'
      });
    }

    // 1) Crear reporte primero
    const nuevoReporte = new Reporte({
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre,
      titulo: titulo || 'Reporte de incidente',
      descripcion,
      imagenUrl: imagenUrl || null,
      imageKey: null,
      estado: 'pendiente',
      fechaCreacion: new Date()
    });

    const reporteGuardado = await nuevoReporte.save();

    // 2) Si viene archivo "imagen", subir a Backblaze y actualizar el reporte
    if (req.file) {
      const { key, publicUrl } = await uploadReportImage({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        userId: uid,
        reporteId: String(reporteGuardado._id),
      });

      reporteGuardado.imageKey = key;

      // si tienes bucket público o public base url configurada, se guarda
      if (publicUrl) reporteGuardado.imagenUrl = publicUrl;

      await reporteGuardado.save();
    }

    console.log(`📝 Nuevo reporte creado en Mongo por: ${email}`);

    return res.status(201).json({
      mensaje: 'Reporte registrado exitosamente',
      reporte: reporteGuardado
    });

  } catch (error) {
    console.error('❌ Error al crear reporte:', error);
    return res.status(500).json({
      error: error.message || 'Error interno del servidor al guardar el reporte'
    });
  }
};

// 2. OBTENER EL HISTORIAL DE REPORTES DEL USUARIO
const obtenerMisReportes = async (req, res) => {
  try {
    const { uid } = req.user;

    const reportes = await Reporte.find({ userId: uid })
      .sort({ fechaCreacion: -1 });

    return res.json({
      mensaje: 'Historial de reportes obtenido',
      cantidad: reportes.length,
      data: reportes
    });

  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    return res.status(500).json({
      error: 'Error al consultar el historial de reportes'
    });
  }
};

// 3. ELIMINAR REPORTE + IMAGEN EN B2
const eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);

    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Solo el dueño (si luego quieres admin, lo ampliamos)
    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado para eliminar este reporte' });
    }

    // borrar imagen en B2 si existe
    if (reporte.imageKey) {
      await deleteReportImage(reporte.imageKey);
    }

    await reporte.deleteOne();

    console.log(`🗑️ Reporte ${id} eliminado por ${uid}`);
    return res.json({ mensaje: 'Reporte e imagen eliminados correctamente' });

  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar el reporte' });
  }
};

const { getSignedReportImageUrl } = require('../services/b2Upload.service');

const obtenerUrlImagenReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    // solo dueño (o admin luego)
    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!reporte.imageKey) {
      return res.status(404).json({ error: 'Este reporte no tiene imagen' });
    }

    const signedUrl = await getSignedReportImageUrl(reporte.imageKey, 300); // 5 min
    return res.json({ url: signedUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error generando URL firmada' });
  }
};


module.exports = {
  crearReporte,
  obtenerMisReportes, // ✅ coma aquí
  eliminarReporte,
  obtenerUrlImagenReporte
};
