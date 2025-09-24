const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
adminSchema.index({ username: 1 }, { unique: true });

// Middleware pour hacher le mot de passe avant la sauvegarde
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Méthode pour mettre à jour la dernière connexion
adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Méthode pour créer le premier administrateur si aucun n'existe
adminSchema.statics.createInitialAdmin = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({
      username: 'admin',
      password: 'admin123' // À changer immédiatement après la première connexion
    });
  }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; 