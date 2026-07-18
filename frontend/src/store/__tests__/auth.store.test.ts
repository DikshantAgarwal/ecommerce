import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import type { User } from '../../types/auth';

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('starts with no authenticated user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth stores user and tokens', () => {
    useAuthStore.getState().setAuth(mockUser, 'refresh_token', 'access_token');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_refresh_token')).toBe('refresh_token');
    expect(localStorage.getItem('auth_access_token')).toBe('access_token');
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
  });

  it('setUser updates user without changing tokens', () => {
    useAuthStore.getState().setAuth(mockUser, 'refresh_token', 'access_token');
    const updatedUser = { ...mockUser, full_name: 'Updated Name' };
    useAuthStore.getState().setUser(updatedUser);
    const state = useAuthStore.getState();
    expect(state.user?.full_name).toBe('Updated Name');
    expect(localStorage.getItem('auth_refresh_token')).toBe('refresh_token');
  });

  it('logout clears user and tokens', () => {
    useAuthStore.getState().setAuth(mockUser, 'refresh_token', 'access_token');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_refresh_token')).toBeNull();
    expect(localStorage.getItem('auth_access_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
