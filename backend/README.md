# Backend QuizMa

Ce dossier contient le backend de l'application QuizMa, une plateforme de quiz pour la Chambre des Conseillers du Parlement marocain.

## Configuration

1. Créez un fichier `.env` à la racine du dossier `backend` avec les variables suivantes :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration de la base de données
MONGODB_URI=mongodb://localhost:27017/quizma

# Configuration JWT
JWT_SECRET=votre_secret_jwt_super_securise

# Configuration CORS
CORS_ORIGIN=http://localhost:3000
```

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur en mode développement
npm run dev

# Démarrer le serveur en mode production
npm start
```

## Structure du projet

```
backend/
├── src/
│   ├── config/         # Configuration (base de données, etc.)
│   ├── controllers/    # Contrôleurs
│   ├── middleware/     # Middleware (auth, validation, etc.)
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   └── app.js         # Point d'entrée de l'application
├── .env               # Variables d'environnement (à créer)
├── package.json
└── README.md
```

## API Endpoints

### Authentification

- `POST /api/auth/login` - Connexion administrateur
- `GET /api/auth/profile` - Profil administrateur (protégé)
- `POST /api/auth/change-password` - Changement de mot de passe (protégé)

## Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les tokens JWT sont utilisés pour l'authentification
- Les routes sensibles sont protégées par middleware d'authentification
- CORS est configuré pour limiter l'accès aux origines autorisées

## Base de données

L'application utilise MongoDB avec Mongoose comme ODM. Les modèles principaux sont :

- `Admin` - Gestion des administrateurs
- `Level` - Niveaux de quiz
- `Question` - Questions et réponses

## Développement

Pour le développement, l'application utilise :
- nodemon pour le rechargement automatique
- dotenv pour les variables d'environnement
- express-validator pour la validation des données
- cors pour la gestion des CORS
- jsonwebtoken pour l'authentification
- bcryptjs pour le hachage des mots de passe 