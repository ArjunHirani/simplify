// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0B0B1A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", gap: 16,
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>
        Simplify<span style={{ color: "#FF4F79" }}>.</span>
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, color: "#FF4F79", fontFamily: "'Syne', sans-serif" }}>404</div>
      <div style={{ fontSize: 16, color: "#A1A1AA" }}>This page doesn&apos;t exist.</div>
      <Link href="/dashboard" style={{
        marginTop: 8, padding: "12px 24px",
        background: "#FF4F79", borderRadius: 12,
        color: "#fff", fontSize: 14, fontWeight: 600,
        textDecoration: "none",
      }}>
        Go to Dashboard
      </Link>
    </div>
  );
}