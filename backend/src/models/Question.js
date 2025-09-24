const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: {
    fr: {
      type: String,
      required: [true, 'Le texte de la réponse en français est requis'],
      trim: true,
      minlength: [1, 'Le texte de la réponse en français doit contenir au moins 1 caractère'],
      maxlength: [200, 'Le texte de la réponse en français ne peut pas dépasser 200 caractères']
    },
    ar: {
      type: String,
      required: [true, 'Le texte de la réponse en arabe est requis'],
      trim: true,
      minlength: [1, 'Le texte de la réponse en arabe doit contenir au moins 1 caractère'],
      maxlength: [200, 'Le texte de la réponse en arabe ne peut pas dépasser 200 caractères']
    }
  },
  isCorrect: {
    type: Boolean,
    required: [true, 'L\'indication de réponse correcte est requise'],
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  text: {
    fr: {
      type: String,
      required: [true, 'Le texte de la question en français est requis'],
      trim: true,
      minlength: [10, 'Le texte de la question en français doit contenir au moins 10 caractères'],
      maxlength: [500, 'Le texte de la question en français ne peut pas dépasser 500 caractères']
    },
    ar: {
      type: String,
      required: [true, 'Le texte de la question en arabe est requis'],
      trim: true,
      minlength: [10, 'Le texte de la question en arabe doit contenir au moins 10 caractères'],
      maxlength: [500, 'Le texte de la question en arabe ne peut pas dépasser 500 caractères']
    }
  },
  answers: {
    type: [answerSchema],
    required: [true, 'Les réponses sont requises'],
    validate: [
      {
        validator: function(answers) {
          return answers.length === 4;
        },
        message: 'La question doit avoir exactement 4 réponses'
      },
      {
        validator: function(answers) {
          return answers.filter(answer => answer.isCorrect).length === 1;
        },
        message: 'La question doit avoir exactement une réponse correcte'
      }
    ]
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: [true, 'Le niveau est requis']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: [true, 'L\'ordre est requis'],
    min: [0, 'L\'ordre doit être un nombre positif']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
questionSchema.index({ level: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ order: 1 });

// Middleware pour valider le niveau avant la sauvegarde
questionSchema.pre('save', async function(next) {
  try {
    const Level = mongoose.model('Level');
    const level = await Level.findById(this.level);
    
    if (!level) {
      throw new Error('Le niveau spécifié n\'existe pas');
    }
    
    if (!level.isActive) {
      throw new Error('Le niveau spécifié n\'est pas actif');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour valider les données avant la sauvegarde
questionSchema.methods.validateData = function() {
  const errors = [];
  
  // Validation du texte de la question
  if (!this.text.fr || !this.text.ar) {
    errors.push('Les textes de la question en français et en arabe sont requis');
  }
  
  // Validation des réponses
  if (!this.answers || this.answers.length !== 4) {
    errors.push('La question doit avoir exactement 4 réponses');
  } else {
    const hasCorrectAnswer = this.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      errors.push('La question doit avoir une réponse correcte');
    }
    
    this.answers.forEach((answer, index) => {
      if (!answer.text.fr || !answer.text.ar) {
        errors.push(`La réponse ${index + 1} doit avoir un texte en français et en arabe`);
      }
    });
  }
  
  // Validation du niveau
  if (!this.level) {
    errors.push('Le niveau est requis');
  }
  
  return errors;
};

// Méthode statique pour réorganiser les questions d'un niveau
questionSchema.statics.reorderQuestions = async function(levelId) {
  const questions = await this.find({ level: levelId }).sort('order');
  for (let i = 0; i < questions.length; i++) {
    questions[i].order = i;
    await questions[i].save();
  }
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 