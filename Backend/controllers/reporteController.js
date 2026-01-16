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
<<<<<<< HEAD
    // Si viene multipart/form-data, req.body existe, pero igual validamos
    const body = req.body || {};

    const laboratorioId = body.laboratorioId;
    const laboratorioNombre = body.laboratorioNombre;
    const titulo = body.titulo;
    const descripcion = body.descripcion;

    const { uid, email } = req.user;

    if (!laboratorioId || !descripcion) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios (laboratorioId o descripcion)'
      });
    }

    // 1) Crear reporte en Mongo primero
    const reporte = await Reporte.create({
=======
    const { laboratorioId, laboratorioNombre, titulo, descripcion } = req.body || {};
    const { uid, email } = req.user;

    if (!laboratorioId || !descripcion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: laboratorioId y/o descripcion' });
    }

    // Crear instancia de reporte
    const nuevoReporte = new Reporte({
>>>>>>> rescue-avances
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre: laboratorioNombre || '',
<<<<<<< HEAD
      titulo: titulo && titulo.trim() ? titulo : 'Reporte de incidente',
      descripcion,
      // IMPORTANTE: ya no guardes imagenUrl porque el bucket es privado
=======
      titulo: titulo?.trim() || 'Reporte de incidente',
      descripcion,
>>>>>>> rescue-avances
      imagenUrl: null,
      imageKey: null,
      estado: 'pendiente',
      fechaCreacion: new Date()
    });

<<<<<<< HEAD
    // 2) Si viene archivo, subir a B2 y guardar el key
    if (req.file) {
      const { key } = await uploadReportImage({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        userId: uid,
        reporteId: String(reporte._id),
      });

      reporte.imageKey = key;
      await reporte.save();
=======
    // Si se adjuntó imagen, subirla
    if (req.file) {
      try {
        const { key } = await uploadReportImage({
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          userId: uid,
          reporteId: String(nuevoReporte._id),
        });

        nuevoReporte.imageKey = key;
      } catch (err) {
        console.error('❌ Error al subir imagen a B2:', err);
        return res.status(500).json({ error: 'Error al subir la imagen del reporte' });
      }
>>>>>>> rescue-avances
    }

    await nuevoReporte.save();

    console.log(`📝 Nuevo reporte creado por ${email} con ID ${nuevoReporte._id}`);
    return res.status(201).json({
      mensaje: 'Reporte registrado exitosamente',
<<<<<<< HEAD
      reporte
=======
      reporte: nuevoReporte
>>>>>>> rescue-avances
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

// 3) ELIMINAR REPORTE + IMAGEN EN B2
const eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    if (reporte.userId !== uid) return res.status(403).json({ error: 'No autorizado' });

<<<<<<< HEAD
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado para eliminar este reporte' });
    }

    // Borrar imagen en B2 si existe
=======
>>>>>>> rescue-avances
    if (reporte.imageKey) {
      try {
        await deleteReportImage(reporte.imageKey);
      } catch (err) {
        console.warn('⚠️ Error al borrar imagen de B2:', err.message);
      }
    }

    await reporte.deleteOne();
    console.log(`🗑️ Reporte eliminado: ${id} por ${uid}`);

<<<<<<< HEAD
    console.log(`🗑️ Reporte ${id} eliminado por ${uid}`);
    return res.json({ mensaje: 'Reporte e imagen eliminados correctamente' });
=======
    return res.json({ mensaje: 'Reporte eliminado correctamente' });
>>>>>>> rescue-avances
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar el reporte' });
  }
};

// 4) OBTENER URL FIRMADA DE IMAGEN (bucket privado)
const obtenerUrlImagenReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const reporte = await Reporte.findById(id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
<<<<<<< HEAD

    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!reporte.imageKey) {
      return res.status(404).json({ error: 'Este reporte no tiene imagen' });
    }

    const signedUrl = await getSignedReportImageUrl(reporte.imageKey, 300); // 5 min
    return res.json({ url: signedUrl });
  } catch (err) {
    console.error('❌ Error generando URL firmada:', err);
    return res.status(500).json({ error: err.message || 'Error generando URL firmada' });
=======
    if (reporte.userId !== uid) return res.status(403).json({ error: 'No autorizado' });
    if (!reporte.imageKey) return res.status(404).json({ error: 'Este reporte no tiene imagen asociada' });

    const signedUrl = await getSignedReportImageUrl(reporte.imageKey, 300); // 5 min
    return res.json({ url: signedUrl });
  } catch (error) {
    console.error('❌ Error generando URL firmada:', error);
    return res.status(500).json({ error: error.message || 'Error al generar la URL de la imagen' });
>>>>>>> rescue-avances
  }
};

module.exports = {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte
};
