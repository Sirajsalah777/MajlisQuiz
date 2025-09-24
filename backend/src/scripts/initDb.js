require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/quizma';

const initializeDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connecté à MongoDB');

    // Vérifier si un admin existe déjà
    const adminExists = await Admin.findOne({ username: 'admin' });
    
    if (!adminExists) {
      // Créer l'admin par défaut
      const admin = new Admin({
        username: 'admin',
        password: 'admin123', // Sera hashé automatiquement par le modèle
        isActive: true
      });

      await admin.save();
      logger.info('Administrateur par défaut créé avec succès');
      logger.info('Username: admin');
      logger.info('Password: admin123');
    } else {
      logger.info('Un administrateur existe déjà');
    }

    // Créer quelques niveaux par défaut
    const Level = require('../models/Level');
    const defaultLevels = [
      {
        name: { fr: 'Débutant', ar: 'مبتدئ' },
        key: 'beginner',
        description: {
          fr: 'Questions de base sur le parlement',
          ar: 'أسئلة أساسية حول البرلمان'
        },
        order: 1,
        isActive: true
      },
      {
        name: { fr: 'Intermédiaire', ar: 'متوسط' },
        key: 'intermediate',
        description: {
          fr: 'Questions plus approfondies sur le fonctionnement parlementaire',
          ar: 'أسئلة أكثر عمقًا حول العمل البرلماني'
        },
        order: 2,
        isActive: true
      },
      {
        name: { fr: 'Expert', ar: 'خبير' },
        key: 'expert',
        description: {
          fr: 'Questions complexes sur le système parlementaire marocain',
          ar: 'أسئلة معقدة حول النظام البرلماني المغربي'
        },
        order: 3,
        isActive: true
      }
    ];

    for (const level of defaultLevels) {
      const existingLevel = await Level.findOne({ 
        'name.fr': level.name.fr 
      });
      
      if (!existingLevel) {
        await Level.create(level);
        logger.info(`Niveau "${level.name.fr}" créé avec succès`);
      }
    }

    logger.info('Initialisation de la base de données terminée avec succès');
    return true;
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

module.exports = initializeDatabase; 