import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string | null;
  cabinetId: string;
  role: {
    slug: string;
    [key: string]: any;
  };
}

interface AuthState {
  user: User | null;
  permissions: string[];
}

const initialState: AuthState = {
  user: null,
  permissions: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; permissions?: string[] }>) => {
      state.user = action.payload.user;
      if (action.payload.permissions) {
        state.permissions = action.payload.permissions;
      }
    },
    logout: (state) => {
      state.user = null;
      state.permissions = [];
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
