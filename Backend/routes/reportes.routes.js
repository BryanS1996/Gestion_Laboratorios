<<<<<<< HEAD
// Backend/routes/reportes.routes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

const {
  crearReporte,
  obtenerMisReportes,
  eliminarReporte,
  obtenerUrlImagenReporte
} = require('../controllers/reporteController');

// Crear reporte (con imagen opcional)
router.post(
  '/',
  authMiddleware(['student', 'professor', 'admin']),
  (req, res, next) => {
    upload.single('imagen')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Archivo demasiado grande o inválido.' });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  crearReporte
);


// Mis reportes
router.get('/mis-reportes', authMiddleware(), obtenerMisReportes);

// URL firmada de imagen
router.get('/:id/imagen-url', authMiddleware(), obtenerUrlImagenReporte);

// Eliminar reporte
router.delete('/:id', authMiddleware(['student', 'professor', 'admin']), eliminarReporte);
=======
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
>>>>>>> rescue-avances

module.exports = router;
