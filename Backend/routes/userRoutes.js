const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protectRoute = require('../middleware/authMiddleware');

// 🔐 New user registration (unprotected)
router.post('/register', userController.registerUser);

// 🔐 Login: Firebase Token → Custom JWT
router.post('/login', userController.login);

// 👤 Get profile (valid JWT required)
router.get('/profile', protectRoute(['admin', 'professor', 'student']), userController.getProfile);

// ✏️ Update profile (valid JWT required)
router.put('/profile', protectRoute(['admin', 'professor', 'student']), userController.updateProfile);

// 🔧 Change user role (admin only)
router.put('/change-role/:uid', protectRoute(['admin']), userController.changeUserRole);

// 🗑️ Delete user (admin only)
router.delete('/:uid', protectRoute(['admin']), userController.deleteUser);

module.exports = router;