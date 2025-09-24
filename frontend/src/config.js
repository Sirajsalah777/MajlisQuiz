// Configuration de l'API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuration de l'application
export const APP_CONFIG = {
  // Langues supportées
  languages: {
    fr: {
      code: 'fr',
      name: 'Français',
      direction: 'ltr',
    },
    ar: {
      code: 'ar',
      name: 'العربية',
      direction: 'rtl',
    },
  },

  // Niveaux de quiz
  quizLevels: {
    beginner: {
      fr: 'Débutant',
      ar: 'مبتدئ',
      timeLimit: 10, // minutes
      minQuestions: 5,
      maxQuestions: 10,
    },
    intermediate: {
      fr: 'Intermédiaire',
      ar: 'متوسط',
      timeLimit: 15, // minutes
      minQuestions: 10,
      maxQuestions: 15,
    },
    expert: {
      fr: 'Expert',
      ar: 'خبير',
      timeLimit: 20, // minutes
      minQuestions: 15,
      maxQuestions: 20,
    },
  },

  // Catégories de quiz
  quizCategories: {
    general: {
      fr: 'Général',
      ar: 'عام',
    },
    history: {
      fr: 'Histoire',
      ar: 'تاريخ',
    },
    politics: {
      fr: 'Politique',
      ar: 'سياسة',
    },
    law: {
      fr: 'Droit',
      ar: 'قانون',
    },
    culture: {
      fr: 'Culture',
      ar: 'ثقافة',
    },
  },

  // Configuration des notifications
  notifications: {
    duration: 5000, // durée d'affichage en ms
    position: 'top-right',
    maxVisible: 3,
  },

  // Configuration du thème
  theme: {
    default: 'light',
    storageKey: 'quiz-theme',
  },

  // Configuration de la langue
  language: {
    default: 'fr',
    storageKey: 'quiz-language',
  },

  // Configuration des résultats
  results: {
    minPassingScore: 60, // pourcentage minimum pour réussir
    showCorrectAnswers: true,
    allowRetry: true,
    maxRetries: 3,
  },

  // Configuration du PDF
  pdf: {
    title: {
      fr: 'Résultats du Quiz - Chambre des Conseillers',
      ar: 'نتائج الاختبار - مجلس المستشارين',
    },
    footer: {
      fr: '© 2024 Chambre des Conseillers - Tous droits réservés',
      ar: '© 2024 مجلس المستشارين - جميع الحقوق محفوظة',
    },
    logo: '/assets/logo.png',
  },

  // Configuration du QR Code
  qrCode: {
    size: 200,
    level: 'H', // niveau de correction d'erreur (L, M, Q, H)
    includeLogo: true,
    logoSize: 0.2, // taille du logo en proportion du QR code
  },

  // Configuration des routes
  routes: {
    home: '/',
    quiz: '/quiz/:id',
    results: '/results/:id',
    admin: '/admin',
    profile: '/profile',
    history: '/history',
    favorites: '/favorites',
  },

  // Configuration de la pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
  },

  // Configuration du cache
  cache: {
    quizList: 5 * 60 * 1000, // 5 minutes
    quizDetails: 30 * 60 * 1000, // 30 minutes
    userStats: 60 * 60 * 1000, // 1 heure
  },

  // Configuration des couleurs principales
  colors: {
    primary: '#C1272D', // Rouge marocain
    secondary: '#006233', // Vert marocain
    accent: '#D4AF37', // Or institutionnel
    success: '#006233',
    error: '#C1272D',
    warning: '#D4AF37',
    info: '#006233',
    text: '#2c3e50',
    background: '#f5f6fa',
  },
}; 