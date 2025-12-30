import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login', credentials),

  register: (data: RegisterData) => 
    api.post('/auth/register', data),

  getCurrentUser: () => 
    api.get('/auth/me'),

  logout: () => 
    api.get('/auth/logout'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/update-password', { currentPassword, newPassword }),
};