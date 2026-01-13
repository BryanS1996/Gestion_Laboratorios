const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAvailability,
  getMyReservas,
  createReserva,
  cancelReserva,
} = require('../controllers/reservasController');

// Disponibilidad por laboratorio y día
router.get('/availability', authMiddleware(), getAvailability);

// Reservas del usuario actual
router.get('/mine', authMiddleware(), getMyReservas);

// Crear reserva (student/professor)
router.post('/', authMiddleware(['student', 'professor']), createReserva);

// Cancelar reserva (dueño o admin)
router.patch('/:id/cancel', authMiddleware(), cancelReserva);

module.exports = router;
