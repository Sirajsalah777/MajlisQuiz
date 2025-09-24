# QuizMa - Plateforme de Quiz sur la Chambre des Conseillers

## Description
QuizMa est une plateforme éducative interactive développée pour la Chambre des Conseillers du Parlement du Royaume du Maroc. Cette application permet aux utilisateurs de tester leurs connaissances sur les institutions parlementaires marocaines à travers différents niveaux de quiz.

## Structure du Projet
```
quizma/
├── frontend/          # Application React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── public/
│
└── backend/           # API Node.js/Express
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── utils/
    └── config/
```

## Technologies Utilisées

### Frontend
- React 18+ avec Vite
- Redux Toolkit pour la gestion d'état
- React Router v6
- Bootstrap 5
- Sass/SCSS
- Framer Motion
- React Query

### Backend
- Node.js
- Express.js
- MySQL/MongoDB
- JWT pour l'authentification

## Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Fonctionnalités Principales
- Quiz multi-niveaux (Débutant, Intermédiaire, Expert)
- Interface bilingue (Français/Arabe)
- Génération de rapports PDF
- Système de QR Code
- Interface d'administration sécurisée

## Licence
Propriété de la Chambre des Conseillers du Parlement du Royaume du Maroc 