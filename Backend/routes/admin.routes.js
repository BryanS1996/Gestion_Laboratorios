const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Reservas
const {
  listReservas,
  updateReserva,
  deleteReserva,
} = require('../controllers/adminReservationsController');

// Laboratorios
const {
  getAdminLaboratoriosEstado,
} = require('../controllers/adminLaboratoriosController');

// Usuarios
const {
  getAdminUsers,
  getAdminUserByUid,
  updateUserRole,
} = require('../controllers/adminUsersController');

// Reportes
const {
  getReportesAdmin,
  updateEstadoReporte,
} = require('../controllers/adminReportesController');

// =======================
// 📌 ROUTES ADMIN
// =======================

// 🧪 LABORATORIOS
router.get(
  '/laboratorios/estado',
  authMiddleware(['admin']),
  getAdminLaboratoriosEstado
);

// 👥 USUARIOS
router.get('/users', authMiddleware(['admin']), getAdminUsers);
router.get('/users/:uid', authMiddleware(['admin']), getAdminUserByUid);
router.patch('/users/:uid/role', authMiddleware(['admin']), updateUserRole);

// 📄 REPORTES
router.get('/reportes', authMiddleware(['admin']), getReportesAdmin);
router.patch('/reportes/:id/estado', authMiddleware(['admin']), updateEstadoReporte);

// 📅 RESERVAS
router.get('/reservas', authMiddleware(['admin']), listReservas);
router.patch('/reservas/:id', authMiddleware(['admin']), updateReserva);
router.delete('/reservas/:id', authMiddleware(['admin']), deleteReserva);

module.exports = router;
