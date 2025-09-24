const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
} = require('../controllers/question.controller');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// Validation des données
const validateQuestion = [
  body('text.fr')
    .trim()
    .notEmpty().withMessage('Le texte de la question en français est requis')
    .isLength({ min: 10, max: 500 }).withMessage('Le texte de la question en français doit contenir entre 10 et 500 caractères'),
  body('text.ar')
    .trim()
    .notEmpty().withMessage('Le texte de la question en arabe est requis')
    .isLength({ min: 10, max: 500 }).withMessage('Le texte de la question en arabe doit contenir entre 10 et 500 caractères'),
  body('answers')
    .isArray({ min: 4, max: 4 }).withMessage('La question doit avoir exactement 4 réponses'),
  body('answers.*.text.fr')
    .trim()
    .notEmpty().withMessage('Le texte de la réponse en français est requis')
    .isLength({ min: 1, max: 200 }).withMessage('Le texte de la réponse en français doit contenir entre 1 et 200 caractères'),
  body('answers.*.text.ar')
    .trim()
    .notEmpty().withMessage('Le texte de la réponse en arabe est requis')
    .isLength({ min: 1, max: 200 }).withMessage('Le texte de la réponse en arabe doit contenir entre 1 et 200 caractères'),
  body('answers.*.isCorrect')
    .isBoolean().withMessage('L\'indication de réponse correcte doit être un booléen'),
  body('level')
    .isMongoId().withMessage('ID de niveau invalide'),
  body('order')
    .isInt({ min: 0 }).withMessage('L\'ordre doit être un nombre positif')
];

// Validation pour la réorganisation
const validateReorder = [
  body('levelId')
    .isMongoId().withMessage('ID de niveau invalide'),
  body('questions')
    .isArray().withMessage('La liste des questions doit être un tableau'),
  body('questions.*.id')
    .isMongoId().withMessage('ID de question invalide'),
  body('questions.*.order')
    .isInt({ min: 0 }).withMessage('L\'ordre doit être un nombre positif')
];

// Routes publiques
router.get('/', getQuestions);
router.get('/:id', getQuestionById);

// Routes protégées
router.post('/', auth, validateQuestion, createQuestion);
router.put('/:id', auth, validateQuestion, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.post('/reorder', auth, validateReorder, reorderQuestions);

module.exports = router; 