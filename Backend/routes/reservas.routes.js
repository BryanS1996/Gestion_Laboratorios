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

/* =========================================
   RUTAS DE RESERVAS
========================================= */

// 1. Disponibilidad (Slots para el modal)
router.get('/availability', authMiddleware(), getAvailability);

// 2. Mis Reservas (Historial del usuario)
router.get('/mine', authMiddleware(), getMyReservas);

// 3. Crear Reserva (Solo estudiantes y profesores)
router.post('/', authMiddleware(['student', 'professor']), createReserva);

// 4. Cancelar Reserva (Cualquier usuario autenticado puede intentar, el controlador valida si es dueño)
router.patch('/:id/cancel', authMiddleware(), cancelReserva);

// 5. ✅ OBTENER TODAS (Para el Catálogo - Esta era la que fallaba 404)
router.get('/', authMiddleware(), getAllReservations);

module.exports = router;