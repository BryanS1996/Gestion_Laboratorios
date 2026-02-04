const express = require('express');
const router = express.Router();

// Importamos el middleware tal como lo usas (como función factory)
const authMiddleware = require('../middleware/authMiddleware');

const {
  getAvailability,
  getMyReservas,
  getAllReservations, 
  createReserva,
  cancelReserva,
} = require('../controllers/reservasController');

// 1. Availability (Slots for the modal)
router.get('/availability', authMiddleware(), getAvailability);

// 2. My Reservations (User history)
router.get('/mine', authMiddleware(), getMyReservas);

// 3. Create Reservation (Students and Professors only)
router.post('/', authMiddleware(['student', 'professor']), createReserva);

// 4. Cancel Reservation (Any authenticated user can attempt, controller validates ownership)
router.patch('/:id/cancel', authMiddleware(), cancelReserva);

// 5. Get AllReservations
router.get('/', authMiddleware(), getAllReservations);

module.exports = router;