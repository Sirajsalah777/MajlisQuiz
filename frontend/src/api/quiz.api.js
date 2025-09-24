import axios from 'axios';
import { API_BASE_URL } from '../config';

// Création d'une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Erreur avec réponse du serveur
      const message = error.response.data.message || 'Une erreur est survenue';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Erreur sans réponse du serveur
      return Promise.reject(new Error('Impossible de se connecter au serveur'));
    } else {
      // Erreur lors de la configuration de la requête
      return Promise.reject(new Error('Erreur de configuration de la requête'));
    }
  }
);

// Service API pour les quiz
export const quizApi = {
  // Récupérer la liste des quiz avec filtres et pagination
  getQuizzes: async ({ search, level, category, sortBy, page }) => {
    const params = new URLSearchParams({
      page,
      limit: 9,
      ...(search && { search }),
      ...(level && { level }),
      ...(category && { category }),
      ...(sortBy && { sortBy }),
    });

    const response = await api.get(`/quiz?${params.toString()}`);
    return response.data;
  },

  // Récupérer un quiz par son ID
  getQuizById: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  },

  // Récupérer les questions d'un quiz par niveau
  getQuizQuestionsByLevel: async (levelId, limit = 10) => {
    const response = await api.get(`/quiz/levels/${levelId}/questions?limit=${limit}`);
    return response.data;
  },

  // Soumettre les réponses d'un quiz
  submitQuiz: async (sessionId, levelId, answers, startTime, endTime, deviceInfo, totalTime, score) => {
    const response = await api.post('/quiz/submit', {
      sessionId,
      levelId,
      answers,
      startTime,
      endTime,
      deviceInfo,
      totalTime,
      score
    });
    return response.data;
  },

  // Récupérer les quiz favoris
  getFavoriteQuizzes: async () => {
    const response = await api.get('/quiz/favorites');
    return response.data;
  },

  // Ajouter un quiz aux favoris
  addFavoriteQuiz: async (quizId) => {
    const response = await api.post(`/quiz/${quizId}/favorite`);
    return response.data;
  },

  // Retirer un quiz des favoris
  removeFavoriteQuiz: async (quizId) => {
    const response = await api.delete(`/quiz/${quizId}/favorite`);
    return response.data;
  },

  // Récupérer l'historique des quiz
  getQuizHistory: async ({ page = 1, limit = 10 }) => {
    const params = new URLSearchParams({ page, limit });
    const response = await api.get(`/quiz/history?${params.toString()}`);
    return response.data;
  },

  // Récupérer les statistiques de l'utilisateur
  getUserStats: async () => {
    const response = await api.get('/quiz/stats');
    return response.data;
  },

  // Récupérer les recommandations de quiz
  getQuizRecommendations: async () => {
    const response = await api.get('/quiz/recommendations');
    return response.data;
  },

  getQuizResult: async (resultId) => {
    const response = await api.get(`/quiz/results/${resultId}`);
    return response.data;
  },
};

// Export par défaut pour la compatibilité
export default quizApi; 