import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/features/auth/types/auth.types';
import { useFavoritesStore } from './useFavoritesStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      updateUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
        useFavoritesStore.getState().clear();
      },
    }),
    {
      name: 'playhub-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
