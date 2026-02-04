const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

const {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte // Use conrrect controller
} = require('../controllers/reporteController');

// My Reports
router.get('/mis-reportes', authMiddleware(['student', 'professor']), obtenerMisReportes);

// Create new report with image
router.post(
  '/',
  authMiddleware(['student', 'professor', 'admin']),
  upload.single('imagen'),
  crearReporte
);

// Get image (Signed URL, controller access only)
router.get(
  '/:id/imagen-url',
  authMiddleware(['student', 'professor']),
  obtenerUrlImagenReporte
);

// Delete
router.delete(
  '/:id',
  authMiddleware(['student', 'professor']),
  eliminarReporte
);

module.exports = router;
