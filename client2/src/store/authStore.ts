import { create } from 'zustand';
import type { User, RegisterData } from '../types';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  initializeAuth: () => {
    const isTokenValid = authService.initializeAuth();
    if (isTokenValid) {
      const savedUser = authService.getCurrentUser();
      set({ user: savedUser, isAuthenticated: true, loading: false });
    } else {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await authService.login(email, password);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (userData: RegisterData) => {
    const response = await authService.register(userData);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
