import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth:     (user: User, accessToken: string, refreshToken: string) => void;
  setTokens:   (accessToken: string, refreshToken: string) => void;
  updateUser:  (user: Partial<User>) => void;
  logout:      () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Global auth state managed with Zustand + localStorage persistence.
 *
 * Tokens are stored in localStorage for simplicity.
 * In a higher-security context, access tokens could be memory-only
 * with refresh tokens in httpOnly cookies (requires backend changes).
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── State ────────────────────────────────────────────────
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      // ── Actions ──────────────────────────────────────────────
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () =>
        set({
          user:            null,
          accessToken:     null,
          refreshToken:    null,
          isAuthenticated: false,
        }),
    }),
    {
      name:    'ai-interview-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive state; tokens are needed for page refresh
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
