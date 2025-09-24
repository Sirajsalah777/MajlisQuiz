require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const logger = require('./utils/logger');

console.log("CWD au démarrage (app.js):", process.cwd());
console.log("Backend JWT_SECRET au démarrage (app.js):", process.env.JWT_SECRET);
console.log("Variables d'environnement complètes (app.js):", process.env);

const app = express();

// Configuration de MongoDB
const mongoUri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
const initializeDatabase = require('./scripts/initDb');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4  // Force l'utilisation d'IPv4
})
.then(() => {
  logger.info('Connecté à MongoDB');
  // Initialisation de la base de données
  return initializeDatabase();
})
.then(() => {
  logger.info('Base de données initialisée avec succès');
})
.catch(err => {
  logger.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));
app.use('/api/levels', require('./routes/level.routes'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Une erreur est survenue' 
        : err.message
    }
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  logger.error('Exception non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Rejet de promesse non géré:', err);
  process.exit(1);
});

module.exports = app; 