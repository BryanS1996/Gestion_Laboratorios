const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getStats, getDisponibilidad, getReservas, getReportes, getUsuarios } = require('../controllers/dashboardController');

// Rutas protegidas - requieren autenticación
router.get('/stats', authMiddleware(), getStats);
router.get('/disponibilidad', authMiddleware(), getDisponibilidad);
router.get('/reservas', authMiddleware(), getReservas);
router.get('/reportes', authMiddleware(['admin']), getReportes);
router.get('/usuarios', authMiddleware(['admin']), getUsuarios);

module.exports = router;
