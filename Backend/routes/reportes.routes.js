const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

const {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte // ✅ usa el controller correcto
} = require('../controllers/reporteController');

// Mis reportes
router.get('/mis-reportes', authMiddleware(['student', 'professor']), obtenerMisReportes);

// Crear nuevo reporte con imagen
router.post(
  '/',
  authMiddleware(['student', 'professor', 'admin']),
  upload.single('imagen'),
  crearReporte
);

// 🔐 Obtener imagen (URL firmada, solo desde controller)
router.get(
  '/:id/imagen-url',
  authMiddleware(['student', 'professor']),
  obtenerUrlImagenReporte
);

// Eliminar
router.delete(
  '/:id',
  authMiddleware(['student', 'professor']),
  eliminarReporte
);

module.exports = router;
