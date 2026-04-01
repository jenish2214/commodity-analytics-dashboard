"use client";

import { useEffect } from "react";

const STORAGE_KEYS = [
  "dashboard_settings",
  "dashboard_portfolio",
  "dashboard_theme",
  "dashboard_currency",
  "dashboard_profile",
  "chart-preferences",
  "ca-dashboard-user",
  "quant-calculator",
];

export default function LogoutPage() {
  useEffect(() => {
    STORAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
    window.location.replace("/");
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "var(--font-poppins), system-ui, sans-serif",
        color: "var(--text-secondary)",
        background: "var(--bg-primary)",
      }}
    >
      Signing out…
    </div>
  );
}
