require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('../models/Level');
const Question = require('../models/Question');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/quizma';

const checkData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connecté à MongoDB');

    // Afficher les niveaux
    const levels = await Level.find({});
    console.log('\n--- NIVEAUX ---');
    levels.forEach(lvl => {
      console.log(`_id: ${lvl._id} | key: ${lvl.key} | nom: ${lvl.name.fr} | actif: ${lvl.isActive}`);
    });

    // Afficher les questions
    const questions = await Question.find({}).populate('level');
    console.log('\n--- QUESTIONS ---');
    questions.forEach(q => {
      const nbReponses = q.answers.length;
      const nbBonnes = q.answers.filter(a => a.isCorrect).length;
      console.log(`\nQuestion: ${q.text.fr}`);
      console.log(`Niveau: ${q.level ? q.level.key : 'inconnu'} (${q.level ? q.level.name.fr : 'inconnu'})`);
      console.log(`Ordre: ${q.order}`);
      console.log(`Nombre de réponses: ${nbReponses}`);
      console.log(`Nombre de bonnes réponses: ${nbBonnes}`);
      q.answers.forEach((a, i) => {
        console.log(`  - [${a.isCorrect ? 'X' : ' '}] ${a.text.fr}`);
      });
    });

    await mongoose.disconnect();
    console.log('\nVérification terminée.');
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    process.exit(1);
  }
};

checkData(); 