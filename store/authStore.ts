import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
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
        // Clear session storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jora-session');
          localStorage.removeItem('jora-messages');
        }
      },
    }),
    {
      name: 'jora-auth',
    }
  )
);
