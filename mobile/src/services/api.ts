import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { storageService } from './storageService';

// Determine default host based on runtime platform
// Android Emulator maps host machine localhost to 10.0.2.2
const DEFAULT_ANDROID_URL = 'http://10.0.2.2:5000';
const DEFAULT_IOS_URL = 'http://localhost:5000';

let currentBaseUrl = Platform.OS === 'android' ? DEFAULT_ANDROID_URL : DEFAULT_IOS_URL;

export const setApiBaseUrl = (newUrl: string): void => {
  currentBaseUrl = newUrl;
  apiClient.defaults.baseURL = newUrl;
};

export const getApiBaseUrl = (): string => currentBaseUrl;

export const apiClient: AxiosInstance = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Listener for unauthorized (401) events to trigger global logout
type UnauthorizedCallback = () => void;
let onUnauthorizedCallback: UnauthorizedCallback | null = null;

export const setOnUnauthorizedCallback = (callback: UnauthorizedCallback): void => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach JWT Bearer Token to outgoing requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storageService.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API Client] Could not read token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Intercept 401 unauthorized responses and expired tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] 401 Unauthorized received. Session invalid or expired.');

      // Clear local credentials
      await storageService.clearAuth();

      // Trigger registered logout action (e.g. Redux dispatch)
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    return Promise.reject(error);
  }
);
