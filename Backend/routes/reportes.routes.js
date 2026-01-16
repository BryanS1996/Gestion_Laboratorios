const express = require('express'); 
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require("../middleware/multerUpload"); // ✅ CORREGIDO

const {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte
} = require('../controllers/reporteController');

// Historial de reportes
router.get('/mis-reportes', authMiddleware(), obtenerMisReportes);

// Crear nuevo reporte (con imagen opcional)
router.post(
  '/',
  authMiddleware(['student', 'professor', 'admin']),
  upload.single("imagen"),
  crearReporte
);

// Eliminar reporte
router.delete(
  "/:id",
  authMiddleware(["student", "professor", "admin"]),
  eliminarReporte
);

// Obtener URL firmada de imagen
router.get(
  "/:id/imagen-url",
  authMiddleware(["student","professor","admin"]),
  obtenerUrlImagenReporte
);

module.exports = router;
