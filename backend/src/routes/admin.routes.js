const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, changePassword } = require('../controllers/auth.controller');
const { 
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} = require('../controllers/question.controller');
const { 
  getLevels, 
  createLevel, 
  updateLevel, 
  deleteLevel 
} = require('../controllers/level.controller');

// Routes protégées par authentification
router.use(auth);

// Routes de profil admin
router.get('/profile', getProfile);
router.put('/profile/password', changePassword);

// Routes des questions
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Routes des niveaux
router.get('/levels', getLevels);
router.post('/levels', createLevel);
router.put('/levels/:id', updateLevel);
router.delete('/levels/:id', deleteLevel);

module.exports = router; 