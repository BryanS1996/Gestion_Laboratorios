const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protectRoute = require('../middleware/authMiddleware');

// 🔐 Registro de nuevo usuario (sin protección)
router.post('/register', userController.registerUser);

// 🔐 Login: Firebase Token → JWT propio
router.post('/login', userController.login);

// 👤 Obtener perfil (requiere JWT válido)
router.get('/profile', protectRoute(['admin', 'professor', 'student']), userController.getProfile);

// ✏️ Actualizar perfil (requiere JWT válido)
router.put('/profile', protectRoute(['admin', 'professor', 'student']), userController.updateProfile);

// 🔧 Cambiar rol de usuario (solo admin)
router.put('/change-role/:uid', protectRoute(['admin']), userController.changeUserRole);

module.exports = router;