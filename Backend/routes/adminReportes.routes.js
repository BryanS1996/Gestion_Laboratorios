const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  getReportesAdmin,
  updateEstadoReporte
} = require('../controllers/adminReportesController');

// ✅ GET /api/admin/reportes
router.get(
  '/reportes',
  authMiddleware(['admin']),
  getReportesAdmin
);

router.patch(
  '/reportes/:id/estado',
  authMiddleware(['admin']),
  updateEstadoReporte
);

module.exports = router;
