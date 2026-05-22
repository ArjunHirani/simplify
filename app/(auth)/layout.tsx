// src/app/(auth)/layout.tsx
// This layout wraps ONLY the auth pages (login, register, forgot-password)
// It renders nothing extra — the pages are full-screen on their own.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}