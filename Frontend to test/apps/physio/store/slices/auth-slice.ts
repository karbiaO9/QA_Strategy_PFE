import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/auth-api';

interface Permission {
  action: string;
  subject: string;
  conditions: any;
}

interface Profile {
  id: string;
  profileType: string;
  cabinetName: string;
  role: { slug: string };
  isActive: boolean;
  permissions?: Permission[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string | null;
  phone: string;
  professionalNumber: string;
}

interface AuthState {
  user: User | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  accessToken: string | null;
  refreshToken: string | null; // Stored in memory
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Helper to get token safely in Next.js (client-side check)
const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pc_access_token');
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  profiles: [],
  activeProfile: null,
  accessToken: getInitialToken(),
  refreshToken: null,
  isAuthenticated: !!getInitialToken(),
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Optimized for /login response
    setCredentials: (
      state,
      action: PayloadAction<{ 
        user: User; 
        accessToken: string; 
        refreshToken: string; 
        profiles: Profile[]; 
        lastProfileId: string 
      }>
    ) => {
      const { user, accessToken, refreshToken, profiles, lastProfileId } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.profiles = profiles;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.activeProfile = profiles.find(p => p.id === lastProfileId) || profiles[0] || null;
      localStorage.setItem('pc_access_token', accessToken);
    },
    
    updateUserInfo: (
      state, 
      action: PayloadAction<{ user: User; profiles: Profile[]; activeProfile: Profile; }>
    ) => {
      console.log("Updating user info in state with:", action.payload);

      state.user = action.payload.user;
      state.profiles = action.payload.profiles;
      state.activeProfile = action.payload.activeProfile;

      console.log("State after updateUserInfo:", JSON.parse(JSON.stringify(state)));
    },

    updateAccessToken: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    switchActiveProfile: (state, action: PayloadAction<string>) => {
      const selected = state.profiles.find(p => p.id === action.payload);
      if (selected) state.activeProfile = selected;
    },

    logoutUser: (state) => {
      state.user = null;
      state.profiles = [];
      state.activeProfile = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('pc_access_token');
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    // This will run on app initialization to check if we have a valid session
    builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.profiles = payload.profiles || [];
      state.isAuthenticated = true;
      state.isInitialized = true;
    });
    builder.addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true; // Mark as done even if it failed
      localStorage.removeItem('pc_access_token');
    });
  }
});

export const { setCredentials, updateUserInfo, updateAccessToken, switchActiveProfile, logoutUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;