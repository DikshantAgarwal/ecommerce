import axios from 'axios';
import { getStoredRefreshToken, STORAGE_KEY_ACCESS, useAuthStore } from '../store/auth.store';
import type { TokenRefreshResponse } from '../types/auth';

export const STORAGE_KEY_SESSION = 'guest_session_id';

function getOrCreateSessionId(): string | null {
  const existing = localStorage.getItem(STORAGE_KEY_SESSION);
  if (existing) return existing;

  if (useAuthStore.getState().user) return null;

  const sessionId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
  return sessionId;
}

export function clearSessionId(): void {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  const sessionId = getOrCreateSessionId();
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = getStoredRefreshToken();
      if (!refresh) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<TokenRefreshResponse>('/auth/token/refresh/', { refresh });
        const newAccessToken = data.access;

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, refresh, newAccessToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
