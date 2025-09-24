import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Créer une instance axios pour les requêtes admin
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonctions d'API
export const getQuestions = () => adminApi.get('/admin/questions');
export const createQuestion = (data) => adminApi.post('/admin/questions', data);
export const updateQuestion = (id, data) => adminApi.put(`/admin/questions/${id}`, data);
export const deleteQuestion = (id) => adminApi.delete(`/admin/questions/${id}`);

export const getLevels = () => adminApi.get('/admin/levels');
export const createLevel = (data) => adminApi.post('/admin/levels', data);
export const updateLevel = (id, data) => adminApi.put(`/admin/levels/${id}`, data);
export const deleteLevel = (id) => adminApi.delete(`/admin/levels/${id}`);

// Authentification admin
export const loginAdmin = (credentials) => adminApi.post('/auth/login', credentials);
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export default {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  loginAdmin,
  logoutAdmin,
};