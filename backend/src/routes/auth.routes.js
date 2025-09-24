const express = require('express');
const router = express.Router();
const { login, getProfile, changePassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Route publique
router.post('/login', login);

// Routes protégées
router.get('/profile', auth, getProfile);
router.post('/change-password', auth, changePassword);

module.exports = router; 