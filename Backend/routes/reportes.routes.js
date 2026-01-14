const express = require('express');
const router = express.Router();

// 1. IMPORTACIÓN CORRECTA:
// Tu archivo exporta la función directa, así que NO usamos llaves { }
const authMiddleware = require('../middleware/authMiddleware'); 

const { crearReporte, obtenerMisReportes } = require('../controllers/reporteController');

// 2. USO CORRECTO:
// Como tu middleware es: (roles) => { return (req, res, next) => ... }
// Tienes que EJECUTARLO con paréntesis () para obtener la función final.

// Ruta: Obtener historial (Cualquier rol autenticado)
router.get('/mis-reportes', authMiddleware(), obtenerMisReportes);

// Ruta: Crear reporte (Roles específicos o todos si lo dejas vacío, según tu lógica)
// Aquí le pasamos los roles permitidos en un array
router.post('/', authMiddleware(['student', 'professor', 'admin']), crearReporte);

module.exports = router;