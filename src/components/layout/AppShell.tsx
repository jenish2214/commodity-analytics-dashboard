"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="ca-shell">
      {sidebarOpen ? (
        <button
          type="button"
          className="ca-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <div className="ca-main">
        <TopNavbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
