const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getFirebaseUsers, firebaseLogin } = require('../controllers/authController');

router.post('/firebase', firebaseLogin);
// // Only admins can view Firebase Auth users
router.get('/firebase-users', authMiddleware(['admin']), getFirebaseUsers);

module.exports = router;
