export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  is_staff?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
}
