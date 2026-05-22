// src/hooks/useAuth.ts
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  upiId?: string;
}

export function useAuth() {
  const router = useRouter();
  const { setUser, clearAuth, user, isAuthenticated } = useAuthStore();

  // ── LOGIN ──────────────────────────────────────────────
  const login = async ({ email, password }: LoginPayload) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    setUser(data.user, data.token);
    router.push("/dashboard");
  };

  // ── REGISTER ───────────────────────────────────────────
  const register = async (payload: RegisterPayload) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    setUser(data.user, data.token);
    router.push("/dashboard");
  };

  // ── GOOGLE OAUTH ───────────────────────────────────────
  // If using NextAuth:  signIn("google", { callbackUrl: "/dashboard" })
  // If using Clerk:     clerk.redirectToSignIn()
  // Below is a stub — swap with your auth provider's method:
  const loginWithGoogle = async () => {
    // Example with NextAuth (install: npm i next-auth):
    // import { signIn } from "next-auth/react";
    // await signIn("google", { callbackUrl: "/dashboard" });

    // Example with Clerk:
    // clerk.redirectToSignIn({ afterSignInUrl: "/dashboard" });

    console.warn("TODO: wire up Google OAuth provider");
    router.push("/dashboard"); // remove this line once real OAuth is wired
  };

  // ── FORGOT PASSWORD ────────────────────────────────────
  const forgotPassword = async (email: string) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send reset email");
    // Success — UI shows confirmation state
  };

  // ── RESET PASSWORD ─────────────────────────────────────
  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset password");

    router.push("/login?reset=success");
  };

  // ── LOGOUT ─────────────────────────────────────────────
  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    logout,
  };
}