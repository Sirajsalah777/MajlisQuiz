const express = require('express');
const router = express.Router();
const {
  getQuizQuestions,
  submitQuiz,
  getLevelStats,
  getQuizResult
} = require('../controllers/quiz.controller');
const { body, param, query } = require('express-validator');

// Validation pour la soumission d'un quiz
const validateQuizSubmission = [
  body('sessionId')
    .notEmpty().withMessage('L\'ID de session est requis')
    .isUUID().withMessage('ID de session invalide'),
  body('levelId')
    .notEmpty().withMessage('L\'ID du niveau est requis')
    .isMongoId().withMessage('ID de niveau invalide'),
  body('answers')
    .isArray().withMessage('Les réponses doivent être un tableau')
    .notEmpty().withMessage('Au moins une réponse est requise'),
  body('answers.*.questionId')
    .notEmpty().withMessage('L\'ID de la question est requis')
    .isMongoId().withMessage('ID de question invalide'),
  body('answers.*.selectedAnswer')
    .isInt({ min: 0, max: 3 }).withMessage('La réponse sélectionnée doit être entre 0 et 3'),
  body('answers.*.timeSpent')
    .isFloat({ min: 0 }).withMessage('Le temps passé doit être un nombre positif'),
  body('startTime')
    .notEmpty().withMessage('La date de début est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('endTime')
    .notEmpty().withMessage('La date de fin est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('deviceInfo')
    .optional()
    .isObject().withMessage('Les informations du dispositif doivent être un objet')
];

// Validation pour les paramètres de requête
const validateQueryParams = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('La limite doit être entre 1 et 50')
];

// Validation des paramètres d'URL
const validateParams = [
  param('levelId')
    .isMongoId().withMessage('ID de niveau invalide'),
  param('resultId')
    .isMongoId().withMessage('ID de résultat invalide')
];

// Routes publiques
router.get('/levels/:levelId/questions', validateParams, validateQueryParams, getQuizQuestions);
router.post('/submit', validateQuizSubmission, submitQuiz);
router.get('/levels/:levelId/stats', validateParams, getLevelStats);
router.get('/results/:resultId', validateParams, getQuizResult);

module.exports = router; 