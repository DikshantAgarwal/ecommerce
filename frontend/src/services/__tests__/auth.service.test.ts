import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/client';
import { googleLogin, refreshToken, getProfile, updateProfile } from '../auth.service';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('googleLogin sends id_token and returns auth response', async () => {
    const mockResponse = {
      data: {
        access: 'access_token',
        refresh: 'refresh_token',
        user: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test',
          avatar: '',
        },
      },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await googleLogin('google_id_token');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/google/', {
      id_token: 'google_id_token',
    });
    expect(result.access).toBe('access_token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('refreshToken sends refresh token and returns new access', async () => {
    const mockResponse = { data: { access: 'new_access_token' } };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await refreshToken('old_refresh');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/token/refresh/', {
      refresh: 'old_refresh',
    });
    expect(result.access).toBe('new_access_token');
  });

  it('getProfile fetches current user', async () => {
    const mockUser = {
      data: { id: '1', email: 'test@example.com', full_name: 'Test', avatar: '' },
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockUser);

    const result = await getProfile();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me/');
    expect(result.email).toBe('test@example.com');
  });

  it('updateProfile sends PATCH with partial fields', async () => {
    const mockResponse = {
      data: { id: '1', email: 'test@example.com', full_name: 'Updated', avatar: '' },
    };
    vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

    const result = await updateProfile({ full_name: 'Updated' });
    expect(apiClient.patch).toHaveBeenCalledWith('/auth/me/', { full_name: 'Updated' });
    expect(result.full_name).toBe('Updated');
  });
});
