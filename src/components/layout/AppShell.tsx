"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useUserStore } from "@/store/userStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUserStore((s) => s.sidebarOpen);
  const toggleSidebar = useUserStore((s) => s.toggleSidebar);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileOverlay(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onBackdropClick = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return (
    <div
      className="ca-shell"
      data-sidebar-open={sidebarOpen ? "true" : "false"}
    >
      {isMobileOverlay && sidebarOpen ? (
        <button
          type="button"
          className="ca-sidebar-backdrop"
          aria-label="Close menu"
          onClick={onBackdropClick}
        />
      ) : null}
      <Sidebar />
      <div
        className="ca-main"
        data-sidebar-open={sidebarOpen ? "true" : "false"}
      >
        <TopNavbar onMenuClick={toggleSidebar} menuOpen={sidebarOpen} />
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
