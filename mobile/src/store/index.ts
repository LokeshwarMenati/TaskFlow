import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logoutUser, forceLogout } from './slices/authSlice';
import tasksReducer, { resetTasksState } from './slices/tasksSlice';
import { setOnUnauthorizedCallback } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Connect Axios 401 interceptor to Redux store
setOnUnauthorizedCallback(() => {
  store.dispatch(forceLogout());
  store.dispatch(resetTasksState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
