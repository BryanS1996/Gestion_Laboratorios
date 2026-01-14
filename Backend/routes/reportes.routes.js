const express = require('express');
const router = express.Router();
const { eliminarReporte } = require("../controllers/reporteController");

// 1. IMPORTACIÓN CORRECTA:
// Tu archivo exporta la función directa, así que NO usamos llaves { }
const authMiddleware = require('../middleware/authMiddleware'); 
const { upload } = require("../middlewares/upload.Middleware");
const { crearReporte, obtenerMisReportes } = require('../controllers/reporteController');

// 2. USO CORRECTO:
// Como tu middleware es: (roles) => { return (req, res, next) => ... }
// Tienes que EJECUTARLO con paréntesis () para obtener la función final.

// Ruta: Obtener historial (Cualquier rol autenticado)
router.get('/mis-reportes', authMiddleware(), obtenerMisReportes);

// Ruta: Crear reporte (Roles específicos o todos si lo dejas vacío, según tu lógica)
// Aquí le pasamos los roles permitidos en un array
router.post('/', authMiddleware(['student', 'professor', 'admin']),upload.single("imagen"), crearReporte);

router.delete(
  "/:id",
  authMiddleware(["student", "professor", "admin"]),
  eliminarReporte
  router.get(
  "/:id/imagen-url",
  authMiddleware(["student","professor","admin"]),
  obtenerUrlImagenReporte
);

);

module.exports = router;