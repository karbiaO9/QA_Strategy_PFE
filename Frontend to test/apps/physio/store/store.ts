import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import { authApi } from './api/auth-api';
import { toastMiddleware } from './middleware/toast-middleware'; // Import the middleware

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .prepend(toastMiddleware.middleware), // Insert ahead of run execution loops
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;