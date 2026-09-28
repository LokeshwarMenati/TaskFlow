import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { storageService } from './storageService';

// Network hosts configuration:
// 192.168.0.3: Host laptop's Wi-Fi LAN IP (Accessible to physical Android phones on the same Wi-Fi)
// 10.0.2.2: Android Emulator special loopback alias
export const DEFAULT_LAN_URL = 'http://192.168.0.3:5000';
export const DEFAULT_EMULATOR_URL = 'http://10.0.2.2:5000';
export const DEFAULT_IOS_URL = 'http://localhost:5000';

let currentBaseUrl = DEFAULT_LAN_URL;

export const setApiBaseUrl = (newUrl: string): void => {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  currentBaseUrl = cleanUrl;
  apiClient.defaults.baseURL = cleanUrl;
};

export const getApiBaseUrl = (): string => currentBaseUrl;

export const initApiBaseUrl = async (): Promise<string> => {
  try {
    const savedUrl = await storageService.getServerUrl();
    if (savedUrl && savedUrl.trim()) {
      setApiBaseUrl(savedUrl);
    }
  } catch (e) {
    console.warn('[API Client] Could not read saved server URL:', e);
  }
  return currentBaseUrl;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: currentBaseUrl,
  timeout: 10000,
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

    // Enhance Network Error with actionable server details
    if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
      const customError = new Error(
        `Network Error: Cannot connect to server at ${currentBaseUrl}. Please ensure your mobile phone is connected to the same Wi-Fi as your computer, or tap 'Server Settings' to change the address.`
      );
      (customError as any).isNetworkError = true;
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);
