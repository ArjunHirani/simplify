// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  fullName: string;
  email: string;
  upiId?: string | null;
  profileImage?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;           // ← ADD THIS
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (val: boolean) => void;  // ← ADD THIS
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setHasHydrated: (val) =>
        set({ _hasHydrated: val }),
    }),
    {
      name: "simplify-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);   // ← fires when localStorage is read
      },
    }
  )
);