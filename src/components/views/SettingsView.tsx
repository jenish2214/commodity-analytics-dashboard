"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import type { CurrencyCode, DashboardFont } from "@/types/models";

const FONT_OPTIONS: DashboardFont[] = [
  "Inter",
  "Roboto",
  "Poppins",
  "Playfair Display",
  "JetBrains Mono",
];

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "JPY", label: "JPY (¥)" },
];

export function SettingsView() {
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  const theme = useUserStore((s) => s.theme);
  const font = useUserStore((s) => s.font);
  const currency = useUserStore((s) => s.currency);
  const notifications = useUserStore((s) => s.notifications);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const setTheme = useUserStore((s) => s.setTheme);
  const setFont = useUserStore((s) => s.setFont);
  const setCurrency = useUserStore((s) => s.setCurrency);
  const toggleNotification = useUserStore((s) => s.toggleNotification);
  const resetAllSettings = useUserStore((s) => s.resetAllSettings);
  const initFromStorage = useUserStore((s) => s.initFromStorage);

  const [localName, setLocalName] = useState(name);
  const [localEmail, setLocalEmail] = useState(email);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    setLocalName(name);
    setLocalEmail(email);
  }, [name, email]);

  const saveProfile = () => {
    updateProfile({ name: localName, email: localEmail });
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
  };

  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Settings</h1>
      <p className="ca-page__lead">
        Profile, appearance, currency, and notifications.
      </p>

      {toast ? (
        <div className="ca-toast" role="status">
          Saved!
        </div>
      ) : null}

      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Profile
        </h2>
        <div className="ca-form">
          <div className="ca-field">
            <label htmlFor="settings-name">Name</label>
            <input
              id="settings-name"
              className="ca-input"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="ca-field">
            <label htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              className="ca-input"
              type="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="button"
            className="ca-btn-primary"
            onClick={saveProfile}
          >
            Save profile
          </button>
        </div>
      </section>

      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Appearance
        </h2>
        <div className="ca-toggle-row" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Theme</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Dark or light interface
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={theme === "dark" ? "ca-btn-primary" : "ca-btn-ghost"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              type="button"
              className={theme === "light" ? "ca-btn-primary" : "ca-btn-ghost"}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>
        <div className="ca-field" style={{ marginTop: 16 }}>
          <label htmlFor="settings-font">Font</label>
          <select
            id="settings-font"
            className="ca-input"
            value={font}
            onChange={(e) => setFont(e.target.value as DashboardFont)}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="ca-field">
          <label htmlFor="settings-currency">Currency</label>
          <select
            id="settings-currency"
            className="ca-input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="ca-card" style={{ marginBottom: "1rem" }}>
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Notifications
        </h2>
        <div className="ca-toggle-row">
          <div>
            <div style={{ fontWeight: 600 }}>Email</div>
          </div>
          <button
            type="button"
            className="ca-switch"
            data-on={notifications.email ? "true" : "false"}
            aria-pressed={notifications.email}
            onClick={() => toggleNotification("email")}
          />
        </div>
        <div className="ca-toggle-row">
          <div>
            <div style={{ fontWeight: 600 }}>Push</div>
          </div>
          <button
            type="button"
            className="ca-switch"
            data-on={notifications.push ? "true" : "false"}
            aria-pressed={notifications.push}
            onClick={() => toggleNotification("push")}
          />
        </div>
        <div className="ca-toggle-row" style={{ borderBottom: "none" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Price alerts</div>
          </div>
          <button
            type="button"
            className="ca-switch"
            data-on={notifications.priceAlerts ? "true" : "false"}
            aria-pressed={notifications.priceAlerts}
            onClick={() => toggleNotification("priceAlerts")}
          />
        </div>
      </section>

      <section className="ca-card">
        <h2
          className="ca-page__title"
          style={{ fontSize: "1.125rem", marginBottom: "1rem" }}
        >
          Danger zone
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
          Clears saved settings and reloads the app.
        </p>
        <button
          type="button"
          className="ca-btn-ghost"
          onClick={() => {
            if (
              window.confirm(
                "Reset all settings and clear local data? This cannot be undone."
              )
            ) {
              resetAllSettings();
            }
          }}
        >
          Reset all settings
        </button>
      </section>
    </div>
  );
}
