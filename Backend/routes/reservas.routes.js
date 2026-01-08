const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Mock controller - a implementar
const reservasController = {
  getAllReservas: (req, res) => {
    res.json({ message: 'Lista de reservas', data: [] });
  },
  getReservaById: (req, res) => {
    res.json({ message: 'Reserva encontrada', data: {} });
  },
  createReserva: (req, res) => {
    res.status(201).json({ message: 'Reserva creada', data: {} });
  },
  updateReserva: (req, res) => {
    res.json({ message: 'Reserva actualizada', data: {} });
  },
  deleteReserva: (req, res) => {
    res.json({ message: 'Reserva eliminada' });
  }
};

// Rutas
router.get('/', authMiddleware(), reservasController.getAllReservas);
router.get('/:id', authMiddleware(), reservasController.getReservaById);
router.post('/', authMiddleware(['student', 'professor']), reservasController.createReserva);
router.put('/:id', authMiddleware(['student', 'professor']), reservasController.updateReserva);
router.delete('/:id', authMiddleware(['student', 'professor']), reservasController.deleteReserva);

module.exports = router;
