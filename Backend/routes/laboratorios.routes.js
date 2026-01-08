const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Mock controller - a implementar
const laboratoriosController = {
  getAllLaboratorios: (req, res) => {
    res.json({ message: 'Lista de laboratorios', data: [] });
  },
  getLaboratorioById: (req, res) => {
    res.json({ message: 'Laboratorio encontrado', data: {} });
  },
  createLaboratorio: (req, res) => {
    res.status(201).json({ message: 'Laboratorio creado', data: {} });
  },
  updateLaboratorio: (req, res) => {
    res.json({ message: 'Laboratorio actualizado', data: {} });
  },
  deleteLaboratorio: (req, res) => {
    res.json({ message: 'Laboratorio eliminado' });
  }
};

// Rutas
router.get('/', laboratoriosController.getAllLaboratorios);
router.get('/:id', laboratoriosController.getLaboratorioById);
router.post('/', authMiddleware(['admin', 'professor']), laboratoriosController.createLaboratorio);
router.put('/:id', authMiddleware(['admin']), laboratoriosController.updateLaboratorio);
router.delete('/:id', authMiddleware(['admin']), laboratoriosController.deleteLaboratorio);

module.exports = router;
