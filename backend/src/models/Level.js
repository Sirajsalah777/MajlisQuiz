const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    fr: {
      type: String,
      required: [true, 'Le nom en français est requis'],
      trim: true,
      minlength: [2, 'Le nom en français doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom en français ne peut pas dépasser 50 caractères']
    },
    ar: {
      type: String,
      required: [true, 'Le nom en arabe est requis'],
      trim: true,
      minlength: [2, 'Le nom en arabe doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom en arabe ne peut pas dépasser 50 caractères']
    }
  },
  key: {
    type: String,
    required: [true, 'La clé du niveau est requise'],
    unique: true,
    trim: true,
    lowercase: true,
    enum: ['beginner', 'intermediate', 'expert'] // Ajustez si vous avez d'autres clés
  },
  description: {
    fr: {
      type: String,
      required: [true, 'La description en français est requise'],
      trim: true,
      minlength: [10, 'La description en français doit contenir au moins 10 caractères'],
      maxlength: [500, 'La description en français ne peut pas dépasser 500 caractères']
    },
    ar: {
      type: String,
      required: [true, 'La description en arabe est requise'],
      trim: true,
      minlength: [10, 'La description en arabe doit contenir au moins 10 caractères'],
      maxlength: [500, 'La description en arabe ne peut pas dépasser 500 caractères']
    }
  },
  order: {
    type: Number,
    required: [true, 'L\'ordre est requis'],
    min: [0, 'L\'ordre doit être un nombre positif'],
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
levelSchema.index({ order: 1 });
levelSchema.index({ isActive: 1 });

// Virtual pour les questions associées
levelSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'level'
});

// Middleware pour mettre à jour l'ordre des autres niveaux lors de la suppression
levelSchema.pre('remove', async function(next) {
  try {
    await this.model('Level').updateMany(
      { order: { $gt: this.order } },
      { $inc: { order: -1 } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode statique pour réorganiser les niveaux
levelSchema.statics.reorderLevels = async function() {
  const levels = await this.find().sort('order');
  for (let i = 0; i < levels.length; i++) {
    levels[i].order = i;
    await levels[i].save();
  }
};

// Méthode pour valider les données avant la sauvegarde
levelSchema.methods.validateData = function() {
  const errors = [];
  
  // Validation des noms
  if (!this.name.fr || !this.name.ar) {
    errors.push('Les noms en français et en arabe sont requis');
  }
  
  // Validation des descriptions
  if (!this.description.fr || !this.description.ar) {
    errors.push('Les descriptions en français et en arabe sont requises');
  }
  
  // Validation de l'ordre
  if (typeof this.order !== 'number' || this.order < 0) {
    errors.push('L\'ordre doit être un nombre positif');
  }
  
  return errors;
};

const Level = mongoose.model('Level', levelSchema);

module.exports = Level; 