const winston = require('winston');
const path = require('path');

// Définition des formats de log
const formats = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuration des transports
const transports = [
  // Console pour le développement
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // Fichier pour les erreurs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Création du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  transports,
  // Gestion des exceptions non capturées
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  // Gestion des rejets de promesses non capturés
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Création du dossier logs s'il n'existe pas
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

module.exports = logger; 