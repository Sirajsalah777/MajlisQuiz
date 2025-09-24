import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './slices/adminSlice';
import quizReducer from './slices/quizSlice';
import uiReducer from './slices/uiSlice';
import publicLevelsReducer from './slices/publicLevelsSlice';

const store = configureStore({
  reducer: {
    admin: adminReducer,
    quiz: quizReducer,
    ui: uiReducer,
    publicLevels: publicLevelsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les actions non-sérialisables pour les dates
        ignoredActions: ['quiz/submitQuiz/fulfilled'],
        ignoredPaths: ['quiz.currentQuiz']
      }
    })
});

export default store; 