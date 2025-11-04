import { apiClient } from '@/lib/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role_id?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Ensure token is stored
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setToken(response.token);
    return response;
  },

  async getProfile(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/profile');
  },

  logout() {
    apiClient.setToken(null);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};


