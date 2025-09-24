import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizApi } from '../../api/quiz.api';
import { APP_CONFIG } from '../../config';

// Actions asynchrones
export const loadQuizzes = createAsyncThunk(
  'quiz/loadQuizzes',
  async ({ search = '', level = null, category = null, sortBy = 'date', page = 1 }, { rejectWithValue }) => {
    try {
      const response = await quizApi.getQuizzes({ search, level, category, sortBy, page });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des quiz');
    }
  }
);

export const loadQuizById = createAsyncThunk(
  'quiz/loadQuizById',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await quizApi.getQuizById(quizId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du quiz');
    }
  }
);

export const loadQuizByLevel = createAsyncThunk(
  'quiz/loadQuizByLevel',
  async (levelId, { rejectWithValue, getState }) => {
    console.log('loadQuizByLevel appelé avec levelId:', levelId);
    try {
      let response;
      try {
        response = await quizApi.getQuizQuestionsByLevel(levelId);
        console.log('DEBUG response brut:', response);
      } catch (err) {
        console.error('ERREUR BRUTE API:', err);
        alert('Erreur lors de la récupération des questions: ' + err.message);
        return rejectWithValue(err.message || 'Erreur lors du chargement du quiz par niveau');
      }
      const data = response;
      console.log('DEBUG data reçu de l\'API:', data);

      const state = getState();
      const language = state.ui.language;
      const publicLevels = state.publicLevels.levels;

      console.log('DEBUG publicLevels:', publicLevels);
      console.log('DEBUG levelId:', levelId);
      const selectedLevel = publicLevels.find(level => level._id == levelId);
      console.log('DEBUG selectedLevel:', selectedLevel);

      if (!selectedLevel) {
        return rejectWithValue('Niveau introuvable dans la liste des niveaux publics.');
      }

      const levelConfig = APP_CONFIG.quizLevels[selectedLevel?.key];
      console.log('DEBUG levelConfig:', levelConfig);
      console.log('DEBUG data.level:', data.level);
      console.log('DEBUG data.questions:', data.questions);
      if (data.questions && data.questions.length > 0) {
        console.log('Exemple de réponses reçues:', data.questions[0].answers);
      }

      if (!levelConfig) {
        return rejectWithValue('Niveau de quiz non configuré dans APP_CONFIG.');
      }

      const quiz = {
        id: data.sessionId,
        title: levelConfig ? levelConfig[language] : selectedLevel?.name[language],
        description: selectedLevel?.description[language],
        timeLimit: levelConfig?.timeLimit,
        level: data.level?.key,
        questions: data.questions?.map(q => ({
          id: q.id,
          text: q.text,
          answers: q.answers?.map(a => ({
            text: a.text,
            id: a._id,
            isCorrect: a.isCorrect
          }))
        })),
      };
      console.log('DEBUG quiz construit:', quiz);

      return quiz;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du quiz par niveau');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await quizApi.submitQuiz(
        payload.sessionId,
        payload.levelId,
        payload.answers,
        payload.startTime,
        payload.endTime,
        payload.deviceInfo
      );
      console.log('DEBUG submitQuiz API response:', response);
      const resultObj = response.result || null;
      console.log('DEBUG submitQuiz thunk - resultObj:', resultObj);
      return { result: resultObj };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Erreur lors de la soumission du quiz' });
    }
  }
);

export const loadFavoriteQuizzes = createAsyncThunk(
  'quiz/loadFavoriteQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await quizApi.getFavoriteQuizzes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des favoris');
    }
  }
);

export const toggleFavoriteQuiz = createAsyncThunk(
  'quiz/toggleFavoriteQuiz',
  async ({ quizId, isFavorite }, { rejectWithValue }) => {
    try {
      if (isFavorite) {
        await quizApi.removeFavoriteQuiz(quizId);
      } else {
        await quizApi.addFavoriteQuiz(quizId);
      }
      return { quizId, isFavorite: !isFavorite };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la modification des favoris');
    }
  }
);

export const loadQuizResult = createAsyncThunk(
  'quiz/loadResult',
  async (resultId, { rejectWithValue }) => {
    console.log('DEBUG loadQuizResult - resultId:', resultId);
    try {
      const result = await quizApi.getQuizResult(resultId);
      console.log('DEBUG loadQuizResult - response:', result);
      return result;
    } catch (error) {
      console.log('DEBUG loadQuizResult - error:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du résultat');
    }
  }
);

// État initial
const initialState = {
  list: [],
  currentQuiz: null,
  favorites: [],
  filters: {
    search: '',
    level: null,
    category: null,
    sortBy: 'date',
  },
  pagination: {
    currentPage: 1,
    pageSize: 9,
    totalItems: 0,
  },
  loading: false,
  error: null,
  submissionStatus: {
    loading: false,
    error: null,
    result: null,
  },
  currentResult: null,
};

// Slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Réinitialiser la page lors du changement de filtres
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
      state.submissionStatus = initialState.submissionStatus;
    },
    clearError: (state) => {
      state.error = null;
      state.submissionStatus.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chargement des quiz
      .addCase(loadQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.quizzes;
        state.pagination.totalItems = action.payload.total;
      })
      .addCase(loadQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Chargement d'un quiz spécifique
      .addCase(loadQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(loadQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Chargement d'un quiz par niveau
      .addCase(loadQuizByLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadQuizByLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(loadQuizByLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Soumission d'un quiz
      .addCase(submitQuiz.pending, (state) => {
        state.submissionStatus.loading = true;
        state.submissionStatus.error = null;
        state.submissionStatus.result = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submissionStatus.loading = false;
        console.log('DEBUG REDUX submitQuiz.fulfilled - action.payload:', action.payload);
        state.submissionStatus.result = action.payload?.result || action.payload?.data?.result || null;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submissionStatus.loading = false;
        if (typeof action.payload === 'object' && action.payload !== null) {
          state.submissionStatus.error = action.payload.message || action.payload.error || 'Erreur lors de la soumission du quiz';
          state.submissionStatus.stack = action.payload.stack || null;
        } else {
          state.submissionStatus.error = action.payload || 'Erreur lors de la soumission du quiz';
          state.submissionStatus.stack = null;
        }
      })

      // Gestion des favoris
      .addCase(loadFavoriteQuizzes.fulfilled, (state, action) => {
        state.favorites = action.payload.map(quiz => quiz._id);
      })
      .addCase(toggleFavoriteQuiz.fulfilled, (state, action) => {
        const { quizId, isFavorite } = action.payload;
        if (isFavorite) {
          state.favorites.push(quizId);
        } else {
          state.favorites = state.favorites.filter(id => id !== quizId);
        }
      })

      // Chargement du résultat d'un quiz
      .addCase(loadQuizResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadQuizResult.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload || null;
      })
      .addCase(loadQuizResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { setFilters, setPagination, clearCurrentQuiz, clearError } = quizSlice.actions;

// Sélecteurs
export const selectQuizzes = (state) => ({
  list: state.quiz.list,
  favorites: state.quiz.favorites,
  loading: state.quiz.loading,
  error: state.quiz.error,
});

export const selectCurrentQuiz = (state) => ({
  quiz: state.quiz.currentQuiz || null,
  loading: state.quiz.loading,
  error: state.quiz.error,
});

export const selectFilters = (state) => state.quiz.filters;
export const selectPagination = (state) => state.quiz.pagination;
export const selectQuizLoading = (state) => state.quiz.loading;
export const selectQuizError = (state) => state.quiz.error;
export const selectSubmissionStatus = (state) => state.quiz.submissionStatus;
export const selectCurrentResult = (state) => state.quiz.currentResult;

export default quizSlice.reducer; 