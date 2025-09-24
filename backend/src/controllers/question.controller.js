const Question = require('../models/Question');
const Level = require('../models/Level');
const mongoose = require('mongoose');

// Obtenir toutes les questions
const getQuestions = async (req, res) => {
  try {
    const { level, isActive } = req.query;
    const query = {};

    if (level) query.level = level;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const questions = await Question.find(query)
      .populate('level', 'name order')
      .sort('order');

    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          ...q.toObject(),
          answers: q.answers.map(a => {
            let answerId = a._id ? a._id.toString() : undefined;
            if (!answerId) {
              answerId = new mongoose.Types.ObjectId().toString();
              a._id = answerId;
            }
            return {
              ...a.toObject(),
              id: answerId
            };
          })
        }))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des questions'
    });
  }
};

// Obtenir une question par ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('level', 'name order');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        question: {
          ...question.toObject(),
          answers: question.answers.map(a => {
            let answerId = a._id ? a._id.toString() : undefined;
            if (!answerId) {
              answerId = new mongoose.Types.ObjectId().toString();
              a._id = answerId;
            }
            return {
              ...a.toObject(),
              id: answerId
            };
          })
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la question:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de la question'
    });
  }
};

// Créer une nouvelle question
const createQuestion = async (req, res) => {
  try {
    const { text, answers, level } = req.body;
    let { order } = req.body;

    // Vérifier si le niveau existe et est actif
    const levelExists = await Level.findOne({ _id: level, isActive: true });
    if (!levelExists) {
      return res.status(400).json({
        success: false,
        message: 'Le niveau spécifié n\'existe pas ou n\'est pas actif'
      });
    }

    // Si l'ordre n'est pas fourni ou s'il y a déjà une question avec cet ordre, attribuer le prochain ordre disponible
    if (order === undefined || order === null) {
      const questionCount = await Question.countDocuments({ level });
      order = questionCount;
    } else {
      const existingQuestionWithOrder = await Question.findOne({ level, order });
      if (existingQuestionWithOrder) {
        const questionCount = await Question.countDocuments({ level });
        order = questionCount;
      }
    }

    // Forcer l'ajout d'un _id à chaque réponse
    if (answers && Array.isArray(answers)) {
      answers.forEach(ans => {
        if (!ans._id) ans._id = new mongoose.Types.ObjectId();
        ans.id = ans._id.toString();
      });
    }

    const question = await Question.create({
      text,
      answers,
      level,
      order
    });

    // Populer le niveau pour la réponse
    await question.populate('level', 'name order');

    res.status(201).json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création de la question'
    });
  }
};

// Mettre à jour une question
const updateQuestion = async (req, res) => {
  try {
    const { text, answers, level, order, isActive } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    // Si le niveau est modifié, vérifier s'il existe et est actif
    if (level && level !== question.level.toString()) {
      const levelExists = await Level.findOne({ _id: level, isActive: true });
      if (!levelExists) {
        return res.status(400).json({
          success: false,
          message: 'Le niveau spécifié n\'existe pas ou n\'est pas actif'
        });
      }
    }

    // Si l'ordre est modifié, vérifier s'il n'existe pas déjà dans ce niveau
    if (order !== undefined && order !== question.order) {
      const existingQuestion = await Question.findOne({
        level: level || question.level,
        order
      });
      if (existingQuestion) {
        return res.status(400).json({
          success: false,
          message: 'Une question avec cet ordre existe déjà dans ce niveau'
        });
      }
    }

    // Mettre à jour les champs
    if (text) question.text = text;
    if (answers) question.answers = answers;
    if (level) question.level = level;
    if (order !== undefined) question.order = order;
    if (isActive !== undefined) question.isActive = isActive;

    // Forcer l'ajout d'un _id à chaque réponse
    if (question.answers && Array.isArray(question.answers)) {
      question.answers.forEach(ans => {
        if (!ans._id) ans._id = new mongoose.Types.ObjectId();
        ans.id = ans._id.toString();
      });
    }

    await question.save();
    await question.populate('level', 'name order');

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour de la question'
    });
  }
};

// Supprimer une question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la suppression de la question'
    });
  }
};

// Réorganiser les questions d'un niveau
const reorderQuestions = async (req, res) => {
  try {
    const { levelId, questions } = req.body;

    if (!levelId || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'ID du niveau et liste des questions requis'
      });
    }

    // Vérifier si le niveau existe
    const levelExists = await Level.findById(levelId);
    if (!levelExists) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé'
      });
    }

    // Mettre à jour l'ordre de chaque question
    for (const { id, order } of questions) {
      await Question.findByIdAndUpdate(id, { order });
    }

    // Récupérer les questions mises à jour
    const updatedQuestions = await Question.find({ level: levelId })
      .populate('level', 'name order')
      .sort('order');

    res.json({
      success: true,
      data: { questions: updatedQuestions }
    });
  } catch (error) {
    console.error('Erreur lors de la réorganisation des questions:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la réorganisation des questions'
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
}; 