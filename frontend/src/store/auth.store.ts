import { create } from 'zustand';
import type { User } from '../types/auth';

export const STORAGE_KEY_REFRESH = 'auth_refresh_token';
export const STORAGE_KEY_ACCESS = 'auth_access_token';
const STORAGE_KEY_USER = 'auth_user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, refreshToken: string, accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

function loadPersistedState(): { user: User | null } {
  try {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    return {
      user: userStr ? (JSON.parse(userStr) as User) : null,
    };
  } catch {
    return { user: null };
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const { user } = loadPersistedState();

  return {
    user,
    isAuthenticated: user !== null,
    isInitialized: true,
    setAuth: (user, refreshToken, accessToken) => {
      localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
      localStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user, isAuthenticated: true });
    },
    setUser: (user) => {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user });
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY_REFRESH);
      localStorage.removeItem(STORAGE_KEY_ACCESS);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ user: null, isAuthenticated: false });
    },
  };
});

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_REFRESH);
}
