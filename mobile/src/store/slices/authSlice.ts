import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthResponseData,
} from '../../types/auth.types';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
};

// Async Thunk: Register
export const registerUser = createAsyncThunk<
  AuthResponseData,
  RegisterCredentials,
  { rejectValue: string }
>('auth/registerUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.register(credentials);
    await storageService.saveToken(data.token);
    await storageService.saveUser(data.user);
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Registration failed. Please check your credentials.';
    return rejectWithValue(message);
  }
});

// Async Thunk: Login
export const loginUser = createAsyncThunk<
  AuthResponseData,
  LoginCredentials,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    await storageService.saveToken(data.token);
    await storageService.saveUser(data.user);
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Invalid email or password.';
    return rejectWithValue(message);
  }
});

// Async Thunk: Restore Session on App Launch
export const restoreSession = createAsyncThunk<
  { user: User; token: string } | null,
  void,
  { rejectValue: string }
>('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const token = await storageService.getToken();
    if (!token) {
      return null;
    }

    // Attempt to verify with backend and fetch fresh user profile
    try {
      const user = await authService.getMe();
      await storageService.saveUser(user);
      return { user, token };
    } catch (apiError: any) {
      // If network is offline, attempt to restore cached user
      const cachedUser = await storageService.getUser();
      if (cachedUser) {
        return { user: cachedUser, token };
      }
      // If token expired (401), clean up
      if (apiError.response?.status === 401) {
        await storageService.clearAuth();
        return null;
      }
      return rejectWithValue('Network error during session restore');
    }
  } catch (error: any) {
    return rejectWithValue('Failed to restore session');
  }
});

// Async Thunk: Logout
export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    await storageService.clearAuth();
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = 'Session expired. Please log in again.';
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Registration failed';
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    });

    // Restore Session
    builder.addCase(restoreSession.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.loading = false;
      state.isInitialized = true;
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.loading = false;
      state.isInitialized = true;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { clearAuthError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
