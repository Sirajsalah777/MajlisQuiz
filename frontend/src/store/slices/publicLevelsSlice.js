import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPublicLevels } from '../../api/public.api';

export const loadPublicLevels = createAsyncThunk(
  'publicLevels/loadPublicLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPublicLevels();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.error.message || 'Erreur de chargement des niveaux publics');
    }
  }
);

const publicLevelsSlice = createSlice({
  name: 'publicLevels',
  initialState: {
    levels: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPublicLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPublicLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload.data;
      })
      .addCase(loadPublicLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.levels = []; // Vider les niveaux en cas d'erreur
      });
  },
});

export const selectPublicLevels = (state) => state.publicLevels;

export default publicLevelsSlice.reducer; 