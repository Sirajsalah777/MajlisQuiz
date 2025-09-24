import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../api/admin.api';

// Thunk pour l'authentification
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminApi.loginAdmin(credentials);
      const { token, admin } = response.data.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      return { token, admin };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        (error.response?.status === 401 
          ? 'Nom d\'utilisateur ou mot de passe incorrect'
          : 'Erreur lors de la connexion')
      );
    }
  }
);

// Thunks pour les questions
export const loadQuestions = createAsyncThunk(
  'admin/loadQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getQuestions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des questions');
    }
  }
);

export const addQuestion = createAsyncThunk(
  'admin/addQuestion',
  async (question, { rejectWithValue }) => {
    try {
      const response = await adminApi.createQuestion(question);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création de la question');
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'admin/updateQuestion',
  async ({ id, question }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateQuestion(id, question);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour de la question');
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'admin/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteQuestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression de la question');
    }
  }
);

// Thunks pour les niveaux
export const loadLevels = createAsyncThunk(
  'admin/loadLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getLevels();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des niveaux');
    }
  }
);

export const addLevel = createAsyncThunk(
  'admin/addLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await adminApi.createLevel(level);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création du niveau');
    }
  }
);

export const updateLevel = createAsyncThunk(
  'admin/updateLevel',
  async ({ id, level }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateLevel(id, level);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du niveau');
    }
  }
);

export const deleteLevel = createAsyncThunk(
  'admin/deleteLevel',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteLevel(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du niveau');
    }
  }
);

const initialState = {
  questions: [],
  levels: [],
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('adminToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion de l'authentification
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('adminUser', JSON.stringify(action.payload.admin));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Gestion des questions
      .addCase(loadQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.data.questions;
      })
      .addCase(loadQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload.data.question);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload.data.question._id);
        if (index !== -1) {
          state.questions[index] = action.payload.data.question;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload);
      })
      // Gestion des niveaux
      .addCase(loadLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload.data;
      })
      .addCase(loadLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addLevel.fulfilled, (state, action) => {
        state.levels.push(action.payload.data);
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        const index = state.levels.findIndex(l => l._id === action.payload.data._id);
        if (index !== -1) {
          state.levels[index] = action.payload.data;
        }
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.levels = state.levels.filter(l => l._id !== action.payload);
      });
  },
});

// Sélecteurs
export const selectQuestions = (state) => state.admin.questions;
export const selectLevels = (state) => ({
  levels: state.admin.levels || [],
  loading: state.admin.loading || false,
  error: state.admin.error || null
});
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectIsAuthenticated = (state) => state.admin.isAuthenticated;

export const { clearError, logout } = adminSlice.actions;

export default adminSlice.reducer; 