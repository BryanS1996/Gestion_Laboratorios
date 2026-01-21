const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getStats,
  getReservas,
} = require('../controllers/dashboardController');

router.get('/stats', authMiddleware(['admin']), getStats);
router.get('/reservas', authMiddleware(['admin']), getReservas);

module.exports = router;
