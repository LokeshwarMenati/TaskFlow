import { apiClient } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponseData,
  User,
} from '../types/auth.types';

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post('/auth/register', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },
};
