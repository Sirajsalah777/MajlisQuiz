const express = require('express');
const router = express.Router();
const { getLevels, createLevel, updateLevel, deleteLevel } = require('../controllers/level.controller');
const auth = require('../middleware/auth');

// Routes publiques (si vous voulez permettre de récupérer les niveaux sans authentification)
router.get('/', getLevels);

// Routes protégées par authentification (pour la gestion CRUD des niveaux)
router.post('/', auth, createLevel);
router.put('/:id', auth, updateLevel);
router.delete('/:id', auth, deleteLevel);

module.exports = router; 