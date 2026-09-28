import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth.types';

const TOKEN_KEY = '@taskflow_auth_token';
const USER_KEY = '@taskflow_auth_user';
const REMEMBER_KEY = '@taskflow_remember_me';

export const storageService = {
  // Token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('[Storage] Error saving auth token:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('[Storage] Error getting auth token:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('[Storage] Error removing auth token:', e);
    }
  },

  // User info
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('[Storage] Error saving user profile:', e);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Storage] Error getting user profile:', e);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('[Storage] Error removing user profile:', e);
    }
  },

  // Remember me preference
  async saveRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
    } catch (e) {
      console.error('[Storage] Error saving remember me flag:', e);
    }
  },

  async getRememberMe(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(REMEMBER_KEY);
      return val !== 'false'; // default to true
    } catch (e) {
      return true;
    }
  },

  // Full clear on logout
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('[Storage] Error clearing auth storage:', e);
    }
  },

  // Custom Server Base URL
  async saveServerUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@taskflow_server_url', url);
    } catch (e) {
      console.error('[Storage] Error saving server url:', e);
    }
  },

  async getServerUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@taskflow_server_url');
    } catch (e) {
      console.error('[Storage] Error getting server url:', e);
      return null;
    }
  },
};

