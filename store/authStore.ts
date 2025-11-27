import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  role: string;
  username: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear specific application state from local storage on logout
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('jora-session');
            localStorage.removeItem('jora-messages');
          } catch (error) {
            console.error('Failed to clear local storage:', error);
          }
        }
      },
    }),
    {
      name: 'jora-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
