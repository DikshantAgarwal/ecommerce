export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
}
