const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  }
});

const quizResultSchema = new mongoose.Schema({
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function(answers) {
        return answers.length > 0;
      },
      message: 'Le quiz doit contenir au moins une réponse'
    }
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalTime: {
    type: Number,
    required: true,
    min: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    language: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
quizResultSchema.index({ level: 1 });
quizResultSchema.index({ sessionId: 1 });
quizResultSchema.index({ createdAt: -1 });

// Méthode pour calculer le score
quizResultSchema.methods.calculateScore = function() {
  const totalQuestions = this.answers.length;
  const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
  this.score = Math.round((correctAnswers / totalQuestions) * 100);
  return this.score;
};

// Méthode pour calculer le temps total
quizResultSchema.methods.calculateTotalTime = function() {
  this.totalTime = this.answers.reduce((total, answer) => total + answer.timeSpent, 0);
  return this.totalTime;
};

// Middleware pour calculer le score et le temps total avant la sauvegarde
quizResultSchema.pre('save', function(next) {
  this.calculateScore();
  this.calculateTotalTime();
  next();
});

// Méthode statique pour obtenir les statistiques d'un niveau
quizResultSchema.statics.getLevelStats = async function(levelId) {
  const stats = await this.aggregate([
    { $match: { level: mongoose.Types.ObjectId(levelId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$totalTime' },
        minScore: { $min: '$score' },
        maxScore: { $max: '$score' },
        minTime: { $min: '$totalTime' },
        maxTime: { $max: '$totalTime' }
      }
    }
  ]);

  return stats[0] || {
    totalQuizzes: 0,
    averageScore: 0,
    averageTime: 0,
    minScore: 0,
    maxScore: 0,
    minTime: 0,
    maxTime: 0
  };
};

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult; 