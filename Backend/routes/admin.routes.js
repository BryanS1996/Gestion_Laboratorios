const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Mock controller - a implementar
const adminController = {
  getDashboard: (req, res) => {
    res.json({ message: 'Dashboard de administrador', data: {} });
  },
  getAllUsers: (req, res) => {
    res.json({ message: 'Lista de usuarios', data: [] });
  },
  getStats: (req, res) => {
    res.json({ message: 'Estadísticas', data: {} });
  }
};

// Rutas - solo acceso de admin
router.get('/dashboard', authMiddleware(['admin']), adminController.getDashboard);
router.get('/users', authMiddleware(['admin']), adminController.getAllUsers);
router.get('/stats', authMiddleware(['admin']), adminController.getStats);

module.exports = router;
