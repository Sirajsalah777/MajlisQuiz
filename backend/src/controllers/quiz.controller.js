const QuizResult = require('../models/QuizResult');
const Question = require('../models/Question');
const Level = require('../models/Level');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Obtenir les questions d'un niveau pour un quiz
const getQuizQuestions = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { limit = 10 } = req.query;

    // Vérifier si le niveau existe et est actif
    const level = await Level.findById(levelId);
    if (!level || !level.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé ou inactif'
      });
    }

    // Obtenir les questions actives du niveau
    const questions = await Question.find({
      level: level._id,
      isActive: true
    })
    .select('text answers')
    .sort('order')
    .limit(parseInt(limit));

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune question disponible pour ce niveau'
      });
    }

    // Générer un ID de session unique
    const sessionId = uuidv4();

    // LOG DEBUG pour vérifier les réponses envoyées
    const debugQuestions = questions.map(q => ({
      id: q._id,
      text: q.text,
      answers: q.answers.map(a => {
        let answerId = a._id ? a._id.toString() : undefined;
        if (!answerId) {
          answerId = new mongoose.Types.ObjectId().toString();
          a._id = answerId;
        }
        return {
          text: a.text,
          id: answerId,
          isCorrect: a.isCorrect
        };
      })
    }));
    console.log('DEBUG BACKEND questions envoyées:', JSON.stringify(debugQuestions, null, 2));

    res.json({
      success: true,
      data: {
        sessionId,
        level: {
          id: level._id,
          key: level.key,
          name: level.name
        },
        questions: debugQuestions
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

// Soumettre les réponses d'un quiz
const submitQuiz = async (req, res) => {
  try {
    const { sessionId, levelId, answers, startTime, endTime, deviceInfo } = req.body;

    // Vérifier si le niveau existe
    console.log('DEBUG BACKEND levelId:', levelId);
    const level = await Level.findById(levelId);
    console.log('DEBUG BACKEND level:', level);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé'
      });
    }

    // Vérifier si toutes les questions existent
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds },
      level: levelId,
      isActive: true
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Certaines questions ne sont pas valides'
      });
    }

    // Créer un map des questions pour vérifier les réponses
    const questionMap = new Map(
      questions.map(q => [q._id.toString(), q])
    );

    // Préparer les réponses avec validation
    const processedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      const isCorrect = question.answers[answer.selectedAnswer].isCorrect;

      return {
        question: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent
      };
    });

    // Calculer le score (nombre de bonnes réponses)
    const score = processedAnswers.filter(a => a.isCorrect).length;
    // Calculer le temps total (en secondes)
    const totalTime = (new Date(endTime) - new Date(startTime)) / 1000;

    // Créer le résultat du quiz
    const quizResult = await QuizResult.create({
      level: levelId,
      answers: processedAnswers,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      sessionId,
      deviceInfo,
      score,
      totalTime
    });

    // Populer les détails des questions pour la réponse
    await quizResult.populate({
      path: 'answers.question',
      select: 'text answers'
    });
    // Populer le niveau pour le titre du quiz
    await quizResult.populate({
      path: 'level',
      select: 'name key',
    });

    res.status(201).json({
      success: true,
      data: {
        result: {
          id: quizResult._id,
          quiz: {
            title: quizResult.level?.name || { fr: 'Quiz', ar: 'اختبار' },
            level: quizResult.level?.key || '',
          },
          score: quizResult.score,
          totalTime: quizResult.totalTime,
          startTime: quizResult.startTime,
          endTime: quizResult.endTime,
          answers: quizResult.answers.map(a => ({
            question: {
              text: a.question.text,
              answers: a.question.answers.map(ans => {
                let answerId = ans._id ? ans._id.toString() : undefined;
                if (!answerId) {
                  answerId = new mongoose.Types.ObjectId().toString();
                  ans._id = answerId;
                }
                return {
                  text: ans.text,
                  id: answerId,
                  isCorrect: ans.isCorrect
                };
              })
            },
            selectedAnswer: a.selectedAnswer,
            isCorrect: a.isCorrect,
            timeSpent: a.timeSpent
          }))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la soumission du quiz',
      error: error.message,
      stack: error.stack
    });
  }
};

// Obtenir les statistiques d'un niveau
const getLevelStats = async (req, res) => {
  try {
    const { levelId } = req.params;

    // Vérifier si le niveau existe
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé'
      });
    }

    // Obtenir les statistiques
    const stats = await QuizResult.getLevelStats(levelId);

    // Obtenir les 10 derniers résultats
    const recentResults = await QuizResult.find({ level: levelId })
      .sort('-createdAt')
      .limit(10)
      .select('score totalTime createdAt');

    res.json({
      success: true,
      data: {
        level: {
          id: level._id,
          name: level.name
        },
        stats: {
          ...stats,
          recentResults
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des statistiques'
    });
  }
};

// Obtenir un résultat de quiz par ID
const getQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await QuizResult.findById(resultId)
      .populate({
        path: 'answers.question',
        select: 'text answers'
      })
      .populate('level', 'name key');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Résultat non trouvé'
      });
    }

    // Sécurisation de la structure
    let quizTitle = { fr: 'Quiz', ar: 'اختبار' };
    let quizLevel = '';
    if (result.level) {
      if (result.level.name && result.level.name.fr && result.level.name.ar) {
        quizTitle = result.level.name;
      }
      if (result.level.key) {
        quizLevel = result.level.key;
      }
    }

    // LOG DEBUG
    console.log('DEBUG quizTitle:', quizTitle);
    console.log('DEBUG quizLevel:', quizLevel);
    console.log('DEBUG réponse envoyée:', {
      id: result._id,
      quiz: { title: quizTitle, level: quizLevel },
      score: result.score,
      totalTime: result.totalTime,
      startTime: result.startTime,
      endTime: result.endTime,
      createdAt: result.createdAt,
      answers: result.answers.map(a => ({
        question: {
          text: a.question?.text || { fr: '', ar: '' },
          answers: Array.isArray(a.question?.answers)
            ? a.question.answers.map(ans => ({
                text: ans.text || { fr: '', ar: '' },
                isCorrect: !!ans.isCorrect
              }))
            : []
        },
        selectedAnswer: a.selectedAnswer ?? null,
        isCorrect: !!a.isCorrect,
        timeSpent: a.timeSpent ?? 0
      }))
    });

    res.json({
      success: true,
      data: {
        result: {
          id: result._id,
          quiz: {
            title: quizTitle,
            level: quizLevel,
          },
          score: result.score ?? 0,
          totalTime: result.totalTime ?? 0,
          startTime: result.startTime ?? null,
          endTime: result.endTime ?? null,
          createdAt: result.createdAt ?? null,
          answers: result.answers.map(a => ({
            question: {
              text: a.question?.text || { fr: '', ar: '' },
              answers: Array.isArray(a.question?.answers)
                ? a.question.answers.map(ans => ({
                    text: ans.text || { fr: '', ar: '' },
                    isCorrect: !!ans.isCorrect
                  }))
                : []
            },
            selectedAnswer: a.selectedAnswer ?? null,
            isCorrect: !!a.isCorrect,
            timeSpent: a.timeSpent ?? 0
          }))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du résultat:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du résultat'
    });
  }
};

module.exports = {
  getQuizQuestions,
  submitQuiz,
  getLevelStats,
  getQuizResult
}; 