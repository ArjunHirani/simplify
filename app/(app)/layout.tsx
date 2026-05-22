// app/(app)/layout.tsx
import Sidebar   from "@/components/layout/Sidebar";
import Topbar    from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0B0B1A",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Sidebar — visible on desktop only via CSS class */}
        <div className="sim-sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}>
          <Topbar />
          <main style={{
            flex: 1,
            padding: "24px 28px",
            overflowY: "auto",
            paddingBottom: "100px",
          }}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Global responsive styles — injected as a plain style tag, no styled-jsx */}
      <style>{`
        .sim-sidebar-wrapper {
          display: none;
        }
        @media (min-width: 1024px) {
          .sim-sidebar-wrapper {
            display: flex;
          }
          main {
            padding-bottom: 24px !important;
          }
        }
      `}</style>
    </>
  );
}