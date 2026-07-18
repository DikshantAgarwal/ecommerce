import apiClient from '../api/client';
import type { AuthResponse, TokenRefreshResponse, User } from '../types/auth';

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/google/', { id_token: idToken });
  return data;
}

export async function refreshToken(token: string): Promise<TokenRefreshResponse> {
  const { data } = await apiClient.post<TokenRefreshResponse>('/auth/token/refresh/', { refresh: token });
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me/');
  return data;
}

export async function updateProfile(payload: Partial<Pick<User, 'full_name' | 'avatar'>>): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/me/', payload);
  return data;
}
