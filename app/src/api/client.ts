import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

// ─── Service URLs ─────────────────────────────────────────────────────────────
// In dev these point to localhost; swap to Render URLs for production.
import { Platform } from 'react-native';

const isAndroidEmulator = Platform.OS === 'android' && __DEV__;
const DEV_HOST = isAndroidEmulator ? '10.0.2.2' : 'localhost';

const CATALOG_BASE_URL =
  process.env.EXPO_PUBLIC_CATALOG_URL ?? `http://${DEV_HOST}:4001`;
const COMMERCE_BASE_URL =
  process.env.EXPO_PUBLIC_COMMERCE_URL ?? `http://${DEV_HOST}:4002`;

// ─── Axios instances ──────────────────────────────────────────────────────────

export const catalogApi = axios.create({
  baseURL: CATALOG_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export const commerceApi = axios.create({
  baseURL: COMMERCE_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth token interceptor ───────────────────────────────────────────────────

const authInterceptor = async (config: any) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore might fail in non-device environments
  }
  return config;
};

catalogApi.interceptors.request.use(authInterceptor);
commerceApi.interceptors.request.use(authInterceptor);


// ─── Response error interceptor ──────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const errorInterceptor = async (error: any) => {
  const originalRequest = error.config;
  
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axios(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // We make a raw axios request here to avoid circular interceptor dependencies
      const response = await axios.post(`${CATALOG_BASE_URL}/api/auth/refresh-token`, { refreshToken });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Update the tokens in the store
      await useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      
      processQueue(null, accessToken);
      
      originalRequest.headers.Authorization = 'Bearer ' + accessToken;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // Normalise to { success: false, message, code }
  const message =
    error.response?.data?.message ??
    error.message ??
    'An unexpected error occurred';
  return Promise.reject({ success: false, message, code: error.response?.status });
};

catalogApi.interceptors.response.use(undefined, errorInterceptor);
commerceApi.interceptors.response.use(undefined, errorInterceptor);
