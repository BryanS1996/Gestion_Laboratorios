const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  listReservas,
  updateReserva,
  deleteReserva,
} = require('../controllers/adminReservationsController');

// 👇 SUBRUTAS ADMIN
router.use('/reportes', require('./adminReportes.routes'));

// Reservas
router.get('/reservas', authMiddleware(['admin']), listReservas);
router.patch('/reservas/:id', authMiddleware(['admin']), updateReserva);
router.delete('/reservas/:id', authMiddleware(['admin']), deleteReserva);

module.exports = router;
