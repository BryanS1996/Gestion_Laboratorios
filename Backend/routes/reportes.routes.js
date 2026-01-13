const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Mock controller - a implementar
const reportesController = {
  getAllReportes: (req, res) => {
    res.json({ message: 'Lista de reportes', data: [] });
  },
  getReporteById: (req, res) => {
    res.json({ message: 'Reporte encontrado', data: {} });
  },
  createReporte: (req, res) => {
    res.status(201).json({ message: 'Reporte creado', data: {} });
  },
  updateReporte: (req, res) => {
    res.json({ message: 'Reporte actualizado', data: {} });
  },
  deleteReporte: (req, res) => {
    res.json({ message: 'Reporte eliminado' });
  }
};

// Rutas
router.get('/', authMiddleware(), reportesController.getAllReportes);
router.get('/:id', authMiddleware(), reportesController.getReporteById);
router.post('/', authMiddleware(['student', 'professor']), reportesController.createReporte);
router.put('/:id', authMiddleware(['admin']), reportesController.updateReporte);
router.delete('/:id', authMiddleware(['admin']), reportesController.deleteReporte);

module.exports = router;
