const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllLaboratorios, createLaboratorio } = require('../controllers/laboratoriosController');

router.get('/', authMiddleware(), getAllLaboratorios);
router.post('/', authMiddleware(['admin', 'professor']), createLaboratorio);

module.exports = router;
