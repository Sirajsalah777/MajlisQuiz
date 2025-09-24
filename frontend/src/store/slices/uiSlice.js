import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'fr',
  isLoading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
  },
});

export const {
  setLanguage,
  setLoading,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer; 