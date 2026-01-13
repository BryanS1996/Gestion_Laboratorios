const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getFirebaseUsers } = require('../controllers/authController');

// Solo admin puede ver los usuarios de Firebase Auth
router.get('/firebase-users', authMiddleware(['admin']), getFirebaseUsers);

module.exports = router;
