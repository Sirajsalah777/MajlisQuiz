const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import des routes
const quizRoutes = require('./routes/quiz.routes');
const adminRoutes = require('./routes/admin.routes');
const levelRoutes = require('./routes/level.routes');
const authRoutes = require('./routes/auth.routes');

// Configuration des variables d'environnement
console.log("CWD au démarrage:", process.cwd());
const dotenvResult = dotenv.config();

if (dotenvResult.error) {
  console.error("Erreur lors du chargement de .env:", dotenvResult.error);
} else {
  console.log(".env chargé avec succès.");
  console.log("Variables chargées par dotenv:", dotenvResult.parsed);
}

console.log("Backend JWT_SECRET au démarrage (après dotenv):", process.env.JWT_SECRET);
console.log("Variables d'environnement complètes (après dotenv):", process.env); // Log pour tout afficher

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/levels', levelRoutes);
app.use('/api/auth', authRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API QuizMa',
    version: '1.0.0',
    endpoints: {
      quiz: '/api/quiz',
      admin: '/api/admin'
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Port d'écoute
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  
  // Créer le compte administrateur initial si aucun n'existe
  try {
    const Admin = require('./models/Admin'); // Importation ici pour s'assurer qu'il est disponible
    await Admin.createInitialAdmin();
    console.log('Vérification de l\'administrateur initial effectuée.');
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur initial:', error);
  }
}); 