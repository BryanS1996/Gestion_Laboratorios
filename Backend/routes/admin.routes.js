const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Controllers
const {
  listReservas,
  updateReserva,
  deleteReserva,
} = require('../controllers/adminReservationsController');

const {
  getAdminUsers,
  getAdminUserByUid,
  updateUserRole,
} = require('../controllers/adminUsersController');

// =======================
// 📌 SUBRUTAS ADMIN
// =======================

// 👉 REPORTES ADMIN
router.use(require('./adminReportes.routes'));
// 👉 USUARIOS ADMIN
router.get(
  '/users',
  authMiddleware(['admin']),
  getAdminUsers
);

// 👉 RESERVAS ADMIN
router.get('/reservas', authMiddleware(['admin']), listReservas);
router.patch('/reservas/:id', authMiddleware(['admin']), updateReserva);
router.delete('/reservas/:id', authMiddleware(['admin']), deleteReserva);
// 👉 USUARIO POR UI D
router.get('/users', authMiddleware(['admin']), getAdminUsers);
router.get('/users/:uid', authMiddleware(['admin']), getAdminUserByUid);
router.patch('/users/:uid/role', authMiddleware(['admin']), updateUserRole);

module.exports = router;
