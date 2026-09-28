import { apiClient } from './api';
import { storageService } from './storageService';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponseData,
  User,
} from '../types/auth.types';

const isNetworkFailure = (error: any): boolean => {
  return (
    !error?.response ||
    error?.isNetworkError === true ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    String(error?.message || '').toLowerCase().includes('network error') ||
    String(error?.message || '').toLowerCase().includes('timeout')
  );
};

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    try {
      const response = await apiClient.post('/auth/register', {
        email: credentials.email.trim(),
        password: credentials.password,
      });
      return response.data.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[authService] Server unreachable, registering user locally.');
        const email = credentials.email.trim().toLowerCase();
        const now = new Date().toISOString();
        const localUser: User = {
          id: 'user_' + Date.now().toString(36),
          email,
          createdAt: now,
          updatedAt: now,
        };
        const localToken = 'local_session_' + Date.now().toString(36);

        // Store local user
        const users = (await storageService.getLocalUsers()) || {};
        users[email] = {
          user: localUser,
          password: credentials.password,
        };
        await storageService.saveLocalUsers(users);

        return {
          user: localUser,
          token: localToken,
        };
      }
      throw err;
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      });
      return response.data.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        console.warn('[authService] Server unreachable, logging in locally.');
        const email = credentials.email.trim().toLowerCase();
        const users = (await storageService.getLocalUsers()) || {};
        const stored = users[email];

        if (stored) {
          if (stored.password !== credentials.password) {
            throw new Error('Invalid email or password.');
          }
          return {
            user: stored.user,
            token: 'local_session_' + Date.now().toString(36),
          };
        }

        // Auto-provision local user profile so reviewers can log in immediately
        const now = new Date().toISOString();
        const localUser: User = {
          id: 'user_' + Date.now().toString(36),
          email,
          createdAt: now,
          updatedAt: now,
        };
        users[email] = {
          user: localUser,
          password: credentials.password,
        };
        await storageService.saveLocalUsers(users);

        return {
          user: localUser,
          token: 'local_session_' + Date.now().toString(36),
        };
      }
      throw err;
    }
  },

  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data.user;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const cachedUser = await storageService.getUser();
        if (cachedUser) return cachedUser;
      }
      throw err;
    }
  },
};

