"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";

export function SettingsView() {
  const profile = useUserStore((s) => s.profile);
  const theme = useUserStore((s) => s.theme);
  const notifications = useUserStore((s) => s.notifications);
  const setProfile = useUserStore((s) => s.setProfile);
  const setTheme = useUserStore((s) => s.setTheme);
  const setNotifications = useUserStore((s) => s.setNotifications);
  const hydrateFromStorage = useUserStore((s) => s.hydrateFromStorage);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile.email, profile.name]);

  const saveProfile = () => {
    setProfile({ name, email });
    try {
      const raw = localStorage.getItem("ca-dashboard-user");
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      localStorage.setItem(
        "ca-dashboard-user",
        JSON.stringify({
          ...parsed,
          profile: { ...profile, name, email },
          notifications,
          theme,
        })
      );
    } catch {
      /* ignore */
    }
  };

  const toggleNotif = (key: "emailAlerts" | "priceAlerts") => {
    setNotifications({ [key]: !notifications[key] });
  };

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Settings</h1>
      <p className="ca-page__lead">Profile, appearance, and alert preferences.</p>

      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          User profile
        </h2>
        <div className="ca-form">
          <div className="ca-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="ca-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="ca-field">
            <label>Subscription plan</label>
            <input value={profile.plan} readOnly aria-readonly />
          </div>
          <button type="button" className="ca-btn ca-btn--primary" onClick={saveProfile}>
            Save profile
          </button>
        </div>
      </section>

      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Theme
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={theme === "light" ? "ca-btn ca-btn--primary" : "ca-btn"}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            type="button"
            className={theme === "dark" ? "ca-btn ca-btn--primary" : "ca-btn"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Notifications
        </h2>
        <div className="ca-toggle-row">
          <div>
            <div style={{ fontWeight: 600 }}>Email alerts</div>
            <div style={{ fontSize: "12px", color: "var(--color-label)" }}>
              Product and research updates
            </div>
          </div>
          <button
            type="button"
            className="ca-switch"
            data-on={notifications.emailAlerts ? "true" : "false"}
            aria-pressed={notifications.emailAlerts}
            onClick={() => toggleNotif("emailAlerts")}
          />
        </div>
        <div className="ca-toggle-row" style={{ borderBottom: "none" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Price alerts</div>
            <div style={{ fontSize: "12px", color: "var(--color-label)" }}>
              Threshold breaches on watchlist
            </div>
          </div>
          <button
            type="button"
            className="ca-switch"
            data-on={notifications.priceAlerts ? "true" : "false"}
            aria-pressed={notifications.priceAlerts}
            onClick={() => toggleNotif("priceAlerts")}
          />
        </div>
      </section>
    </div>
  );
}
