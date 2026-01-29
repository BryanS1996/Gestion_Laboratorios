const Reporte = require('../models/Reporte');
const reportLogger = require('../config/report.logger');
const {
  uploadReportImage,
  deleteReportImage,
  getSignedReportImageUrl
} = require('../services/b2Upload.service.js');

/* ======================================================
   CREATE REPORT (optional image + optional reservationId)
====================================================== */
const crearReporte = async (req, res, next) => {
  try {
    const {
      laboratorioId,
      laboratorioNombre,
      titulo,
      descripcion,
      reservaId
    } = req.body || {};

    const { uid, email } = req.user;

    // Log report creation attempt
    reportLogger.info(
      `Report creation attempt | user=${uid} reservation=${reservaId || 'N/A'}`,
      { requestId: req.requestId }
    );

    if (!laboratorioId || !descripcion) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios: laboratorioId y/o descripcion'
      });
    }

    // Create report instance without image
    const nuevoReporte = new Reporte({
      reservaId: reservaId || null,
      userId: uid,
      userEmail: email,
      laboratorioId,
      laboratorioNombre: laboratorioNombre || '',
      titulo: titulo?.trim() || 'Reporte de incidente',
      descripcion,
      imageKey: null,
      estado: 'pendiente',
      fechaCreacion: new Date()
    });

    // Upload image to Backblaze if provided
    if (req.file) {
      try {
        // Log image upload request
        reportLogger.info(
          `Report image upload requested | user=${uid} reportId=${nuevoReporte._id}`,
          { requestId: req.requestId }
        );

        const { key } = await uploadReportImage({
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          userId: uid,
          reporteId: String(nuevoReporte._id),
        });

        nuevoReporte.imageKey = key;

        // Log successful image upload
        reportLogger.info(
          `Report image uploaded | user=${uid} reportId=${nuevoReporte._id} key=${key}`,
          { requestId: req.requestId }
        );
      } catch (err) {
        // Log controlled image upload error
        reportLogger.error(
          `Report image upload failed | user=${uid} reportId=${nuevoReporte._id}`,
          { requestId: req.requestId, stack: err.stack }
        );

        return res.status(500).json({
          error: 'Error al subir la imagen del reporte'
        });
      }
    }

    await nuevoReporte.save();

    // Log successful report creation
    reportLogger.info(
      `Report created | reportId=${nuevoReporte._id} user=${uid} reservation=${reservaId || 'N/A'}`,
      { requestId: req.requestId }
    );

    return res.status(201).json({
      mensaje: 'Reporte registrado exitosamente',
      reporte: nuevoReporte
    });

  } catch (error) {
    // Delegate unexpected errors to global error handler
    next(error);
  }
};

/* ======================================================
   GET USER REPORTS
====================================================== */
const obtenerMisReportes = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Log reports fetch
    reportLogger.info(
      `Reports fetch | user=${uid}`,
      { requestId: req.requestId }
    );

    const reportes = await Reporte
      .find({ userId: uid })
      .sort({ fechaCreacion: -1 });

    return res.json({
      mensaje: 'Historial de reportes obtenido',
      cantidad: reportes.length,
      data: reportes
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   DELETE REPORT + IMAGE
====================================================== */
const eliminarReporte = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    // Log report deletion attempt
    reportLogger.info(
      `Report deletion attempt | reportId=${id} user=${uid}`,
      { requestId: req.requestId }
    );

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (reporte.imageKey) {
      try {
        await deleteReportImage(reporte.imageKey);

        // Log successful image deletion
        reportLogger.info(
          `Report image deleted | reportId=${id} key=${reporte.imageKey}`,
          { requestId: req.requestId }
        );
      } catch (err) {
        // Log deletion warning but continue
        reportLogger.warn(
          `Report image delete failed | reportId=${id} key=${reporte.imageKey}`,
          { requestId: req.requestId, stack: err.stack }
        );
      }
    }

    await reporte.deleteOne();

    // Log successful report deletion
    reportLogger.info(
      `Report deleted | reportId=${id} deletedBy=${uid}`,
      { requestId: req.requestId }
    );

    return res.json({ mensaje: 'Reporte eliminado correctamente' });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET SIGNED IMAGE URL
====================================================== */
const obtenerUrlImagenReporte = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    // Log signed URL request
    reportLogger.info(
      `Report image URL requested | reportId=${id} user=${uid}`,
      { requestId: req.requestId }
    );

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    if (reporte.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!reporte.imageKey) {
      return res.status(404).json({ error: 'Este reporte no tiene imagen asociada' });
    }

    const signedUrl = await getSignedReportImageUrl(reporte.imageKey, 300);

    return res.json({ url: signedUrl });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte,
};
