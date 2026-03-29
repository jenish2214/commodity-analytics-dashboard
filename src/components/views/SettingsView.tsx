"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import type { CurrencyCode } from "@/types/models";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "JPY", label: "JPY (¥)" },
];

export function SettingsView() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  const theme = useUserStore((s) => s.theme);
  const currency = useUserStore((s) => s.currency);
  const notifications = useUserStore((s) => s.notifications);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const setTheme = useUserStore((s) => s.setTheme);
  const setCurrency = useUserStore((s) => s.setCurrency);
  const toggleNotification = useUserStore((s) => s.toggleNotification);
  const resetAllSettings = useUserStore((s) => s.resetAllSettings);
  const initFromStorage = useUserStore((s) => s.initFromStorage);

  const [localName, setLocalName] = useState(name);
  const [localEmail, setLocalEmail] = useState(email);
  const [toast, setToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleReset = () => {
    resetAllSettings();
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{
      maxWidth: "680px",
      margin: "0 auto",
      padding: "40px 24px",
    }}>
      <button onClick={() => router.back()} style={{
        display: "flex", alignItems: "center", gap: "6px",
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-secondary)", fontSize: "14px",
        padding: "0 0 20px 0", fontFamily: "inherit"
      }}>
        <ArrowLeft size={16} /> Back
      </button>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "4px" }}>
        Settings
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Manage your account and preferences
      </p>

      {toast ? (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "var(--accent)", color: "var(--bg-primary)",
          padding: "12px 16px", borderRadius: "8px",
          fontSize: "14px", fontWeight: 500, zIndex: 1000
        }} role="status">
          ✓ Saved
        </div>
      ) : null}

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: "16px",
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>
          PROFILE
        </h2>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "var(--accent)", color: "var(--bg-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 600, marginRight: "16px"
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px" }}>{name}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{email}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="settings-name" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
              Name
            </label>
            <input
              id="settings-name"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "6px",
                border: "1px solid var(--border)", background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit"
              }}
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="settings-email" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>
              Email
            </label>
            <input
              id="settings-email"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "6px",
                border: "1px solid var(--border)", background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit"
              }}
              type="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="button"
            onClick={saveProfile}
            style={{
              padding: "10px 16px", borderRadius: "6px",
              background: "var(--accent)", color: "var(--bg-primary)",
              border: "none", fontSize: "14px", fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start"
            }}
          >
            Save
          </button>
        </div>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: "16px",
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>
          APPEARANCE
        </h2>
        <div>
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>Theme</div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Dark or light interface
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>

          {/* Dark card */}
          <button
            onClick={() => setTheme("dark")}
            style={{
              flex: 1,
              padding: "24px 16px",
              borderRadius: "var(--radius-lg)",
              border: theme === "dark" ? "2px solid var(--text-primary)" : "1px solid var(--border)",
              background: theme === "dark" ? "var(--text-primary)" : "var(--bg-card)",
              color: theme === "dark" ? "var(--bg-primary)" : "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              transition: "all 200ms ease",
              fontFamily: "inherit",
            }}
          >
            <Moon size={28} />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Dark</span>
            {theme === "dark" && (
              <span style={{ fontSize: "11px", opacity: 0.6 }}>● Active</span>
            )}
          </button>

          {/* Light card */}
          <button
            onClick={() => setTheme("light")}
            style={{
              flex: 1,
              padding: "24px 16px",
              borderRadius: "var(--radius-lg)",
              border: theme === "light" ? "2px solid var(--text-primary)" : "1px solid var(--border)",
              background: theme === "light" ? "var(--text-primary)" : "var(--bg-card)",
              color: theme === "light" ? "var(--bg-primary)" : "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              transition: "all 200ms ease",
              fontFamily: "inherit",
            }}
          >
            <Sun size={28} />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Light</span>
            {theme === "light" && (
              <span style={{ fontSize: "11px", opacity: 0.6 }}>● Active</span>
            )}
          </button>

          {/* Navy card */}
          <button
            onClick={() => setTheme("navy")}
            style={{
              flex: 1,
              padding: "24px 16px",
              borderRadius: "var(--radius-lg)",
              border: theme === "navy" ? "2px solid #3b82f6" : "1px solid var(--border)",
              background: theme === "navy" ? "#0f172a" : "var(--bg-card)",
              color: theme === "navy" ? "#f8fafc" : "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              transition: "all 200ms ease",
              fontFamily: "inherit",
            }}
          >
            <div style={{
              width: "28px",
              height: "28px",
              background: "#3b82f6",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "12px"
            }}>N</div>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Navy</span>
            {theme === "navy" && (
              <span style={{ fontSize: "11px", opacity: 0.6 }}>● Active</span>
            )}
          </button>
        </div>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: "16px",
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>
          NOTIFICATIONS
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Receive email notifications
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("email")}
              style={{
                width: "44px", height: "24px", borderRadius: "12px",
                background: notifications.email ? "var(--accent)" : "var(--border)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 200ms ease"
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "white", position: "absolute", top: "2px",
                left: notifications.email ? "22px" : "2px",
                transition: "left 200ms ease"
              }} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Push</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Receive push notifications
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("push")}
              style={{
                width: "44px", height: "24px", borderRadius: "12px",
                background: notifications.push ? "var(--accent)" : "var(--border)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 200ms ease"
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "white", position: "absolute", top: "2px",
                left: notifications.push ? "22px" : "2px",
                transition: "left 200ms ease"
              }} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Price Alerts</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Get notified about price changes
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification("priceAlerts")}
              style={{
                width: "44px", height: "24px", borderRadius: "12px",
                background: notifications.priceAlerts ? "var(--accent)" : "var(--border)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 200ms ease"
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "white", position: "absolute", top: "2px",
                left: notifications.priceAlerts ? "22px" : "2px",
                transition: "left 200ms ease"
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(220,38,38,0.25)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        marginBottom: "16px",
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>
          DANGER ZONE
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Clears saved settings and reloads the app.
        </p>
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            style={{
              padding: "8px 16px", borderRadius: "6px",
              background: "transparent", color: "rgb(220, 38, 38)",
              border: "1px solid rgb(220, 38, 38)", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", fontFamily: "inherit"
            }}
          >
            Reset all settings
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Are you sure?
            </span>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              style={{
                padding: "6px 12px", borderRadius: "4px",
                background: "var(--bg-card)", color: "var(--text-primary)",
                border: "1px solid var(--border)", fontSize: "12px",
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "6px 12px", borderRadius: "4px",
                background: "rgb(220, 38, 38)", color: "white",
                border: "none", fontSize: "12px", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
