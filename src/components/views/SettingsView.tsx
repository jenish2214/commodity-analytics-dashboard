"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Palette, Bell, BarChart2, Shield, AlertTriangle,
  Camera, Moon, Sun, Check, ChevronDown, Globe, Clock,
  RefreshCw, KeyRound, LogOut, Download, Trash2, X,
  Mail, Smartphone, TrendingUp, Newspaper, FileText, ArrowLeft
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useChartPreferencesStore } from "@/store/chartPreferencesStore";
import type { CurrencyCode } from "@/types/models";
import {
  ACCENT_COLORS, FONT_SIZES, LANGUAGES, REFRESH_RATES,
  SESSION_TIMEOUTS, TIMEZONES,
  type AccentColorId, type FontSizeOption,
  type LanguageCode, type Timezone,
} from "@/store/userStore";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "profile" | "appearance" | "notifications" | "data" | "security";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "data", label: "Data & Markets", icon: <BarChart2 size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
];

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "JPY", label: "JPY (¥)" },
];

const CHART_TYPE_OPTIONS = [
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "candlestick", label: "Candlestick" },
];

const INDICATOR_OPTIONS = [
  { value: "price", label: "Price" },
  { value: "volume", label: "Volume" },
  { value: "sma", label: "SMA" },
  { value: "ema", label: "EMA" },
  { value: "rsi", label: "RSI" },
  { value: "macd", label: "MACD" },
  { value: "bollinger", label: "Bollinger Bands" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SettingsCard({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${danger ? "rgba(239,68,68,.3)" : "var(--border)"}`,
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--text-secondary)",
      marginBottom: "20px",
    }}>
      {children}
    </h3>
  );
}

function Toggle({ on, onChange, id }: { on: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: "44px", height: "24px", borderRadius: "12px", flexShrink: 0,
        background: on ? "var(--accent)" : "var(--border)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 200ms ease",
      }}
    >
      <span style={{
        display: "block",
        width: "18px", height: "18px", borderRadius: "50%",
        background: "white",
        position: "absolute", top: "3px",
        left: on ? "23px" : "3px",
        transition: "left 200ms cubic-bezier(.4,0,.2,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,.3)",
      }} />
    </button>
  );
}

function NotificationRow({
  icon, label, desc, checked, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>{label}</div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{desc}</div>
        </div>
      </div>
      <Toggle on={checked} onChange={onChange} />
    </div>
  );
}

function SelectField<T extends string>({
  label, value, options, onChange, icon,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
        {icon && <span style={{ marginRight: "6px", verticalAlign: "middle" }}>{icon}</span>}
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          style={{
            width: "100%", padding: "10px 36px 10px 12px",
            borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg-primary)", color: "var(--text-primary)",
            fontSize: "14px", fontFamily: "inherit", cursor: "pointer",
            appearance: "none", outline: "none",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} style={{
          position: "absolute", right: "12px", top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none",
          color: "var(--text-secondary)",
        }} />
      </div>
    </div>
  );
}

function InputField({
  id, label, value, onChange, type = "text", placeholder, maxLength,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; type?: string;
  placeholder?: string; maxLength?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} placeholder={placeholder ?? ""}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px", borderRadius: "8px",
          border: "1px solid var(--border)", background: "var(--bg-primary)",
          color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit",
          outline: "none", width: "100%",
        }}
      />
    </div>
  );
}

function PrimaryButton({ onClick, children, loading }: {
  onClick: () => void; children: React.ReactNode; loading?: boolean;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      style={{
        padding: "10px 20px", borderRadius: "8px",
        background: "var(--accent)", color: "white",
        border: "none", fontSize: "14px", fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", opacity: loading ? 0.7 : 1,
        display: "flex", alignItems: "center", gap: "6px",
        transition: "opacity 150ms",
      }}
    >
      {children}
    </button>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { name, email, phone, bio, avatar, timezone, language,
    updateProfile, setAvatar, setTimezone, setLanguage } = useUserStore();

  const [local, setLocal] = useState({ name, email, phone, bio });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocal({ name, email, phone, bio }); }, [name, email, phone, bio]);

  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(local);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Avatar must be under 2 MB");
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <SettingsCard>
        <SectionTitle>Personal Information</SectionTitle>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {avatar ? (
              <img src={avatar} alt="avatar" style={{
                width: "72px", height: "72px", borderRadius: "50%",
                objectFit: "cover", border: "3px solid var(--accent)",
              }} />
            ) : (
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "var(--accent)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", fontWeight: 700,
                border: "3px solid var(--accent)",
              }}>
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Upload avatar"
              style={{
                position: "absolute", bottom: "-2px", right: "-2px",
                width: "26px", height: "26px", borderRadius: "50%",
                background: "var(--bg-card)", border: "2px solid var(--border)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--accent)",
              }}
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>{name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{email}</div>
            {avatar && (
              <button type="button" onClick={() => setAvatar(null)} style={{
                marginTop: "6px", fontSize: "12px", color: "var(--text-secondary)",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", padding: 0,
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <X size={11} /> Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="ca-grid-2">
          <InputField id="s-name" label="Full Name" value={local.name} onChange={(v) => setLocal({ ...local, name: v })} />
          <InputField id="s-email" label="Email" value={local.email} onChange={(v) => setLocal({ ...local, email: v })} type="email" />
          <InputField id="s-phone" label="Phone" value={local.phone} onChange={(v) => setLocal({ ...local, phone: v })} placeholder="+1 555 000 0000" />
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Bio
          </label>
          <textarea
            id="s-bio" value={local.bio} maxLength={200}
            placeholder="A short bio about yourself…"
            onChange={(e) => setLocal({ ...local, bio: e.target.value })}
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: "8px",
              border: "1px solid var(--border)", background: "var(--bg-primary)",
              color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit",
              resize: "vertical", outline: "none",
            }}
          />
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "right", marginTop: "4px" }}>
            {local.bio.length}/200
          </div>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <PrimaryButton onClick={handleSave} loading={saving}>
            {saved ? <><Check size={14} /> Saved</> : saving ? "Saving…" : "Save Profile"}
          </PrimaryButton>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Localisation</SectionTitle>
        <div className="ca-grid-2">
          <SelectField<Timezone>
            label="Timezone" value={timezone}
            options={TIMEZONES.map((t) => ({ value: t, label: t.replace("_", " ") }))}
            onChange={setTimezone} icon={<Clock size={13} />}
          />
          <SelectField<LanguageCode>
            label="Language" value={language}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            onChange={setLanguage} icon={<Globe size={13} />}
          />
        </div>
      </SettingsCard>
    </>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, accentColorId, fontSize, compactMode, currency,
    setTheme, setAccentColor, setFontSize, setCompactMode, setCurrency } = useUserStore();

  const themeOptions: { id: "dark" | "light" | "navy"; label: string; bg: string; fg: string; border: string }[] = [
    { id: "dark", label: "Dark", bg: "#0f172a", fg: "#f8fafc", border: "#334155" },
    { id: "light", label: "Light", bg: "#f8fafc", fg: "#0f172a", border: "#cbd5e1" },
    { id: "navy", label: "Navy", bg: "#0a1628", fg: "#e2e8f0", border: "#3b82f6" },
  ];

  return (
    <>
      <SettingsCard>
        <SectionTitle>Theme</SectionTitle>
        <div className="ca-grid-3">
          {themeOptions.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id} type="button" onClick={() => setTheme(t.id)}
                style={{
                  padding: "20px 16px", borderRadius: "10px",
                  border: `2px solid ${active ? "var(--accent)" : t.border}`,
                  background: t.bg, color: t.fg,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "10px",
                  transition: "border-color 150ms, box-shadow 150ms",
                  boxShadow: active ? "0 0 0 3px var(--accent)22" : "none",
                }}
              >
                <div style={{
                  width: "40px", height: "28px", borderRadius: "5px",
                  background: t.bg, border: `1px solid ${t.border}`,
                  display: "flex", gap: "4px", padding: "6px",
                }}>
                  <div style={{ flex: 1, background: t.border, borderRadius: "2px" }} />
                  <div style={{ flex: 2, background: t.fg + "22", borderRadius: "2px" }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>{t.label}</span>
                {active && <Check size={14} style={{ color: "var(--accent)" }} />}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Accent Colour</SectionTitle>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {ACCENT_COLORS.map((c) => {
            const active = accentColorId === c.id;
            return (
              <button
                key={c.id} type="button" onClick={() => setAccentColor(c.id as AccentColorId)}
                title={c.id}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: c.value, border: `3px solid ${active ? "white" : "transparent"}`,
                  cursor: "pointer",
                  outline: active ? `3px solid ${c.value}` : "none",
                  outlineOffset: "2px",
                  transition: "outline 150ms",
                }}
              />
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Display Options</SectionTitle>
        <div className="ca-grid-2">
          <div>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Font Size
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {FONT_SIZES.map((s) => {
                const labels: Record<string, string> = { sm: "Small", md: "Medium", lg: "Large" };
                const active = fontSize === s;
                return (
                  <button
                    key={s} type="button" onClick={() => setFontSize(s as FontSizeOption)}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "8px",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent)15" : "var(--bg-primary)",
                      color: active ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: active ? 700 : 400, fontSize: "13px",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>Compact Mode</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Reduce spacing throughout the UI
              </div>
            </div>
            <Toggle on={compactMode} onChange={setCompactMode} />
          </div>
        </div>

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <SelectField<CurrencyCode>
            label="Default Currency"
            value={currency}
            options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: c.label }))}
            onChange={setCurrency}
          />
        </div>
      </SettingsCard>
    </>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const { notifications, toggleNotification, setNotificationFrequency } = useUserStore();

  return (
    <>
      <SettingsCard>
        <SectionTitle>Channels</SectionTitle>
        <NotificationRow
          icon={<Mail size={16} />} label="Email Alerts"
          desc="Receive alerts and summaries to your inbox"
          checked={notifications.email}
          onChange={() => toggleNotification("email")}
        />
        <NotificationRow
          icon={<Smartphone size={16} />} label="Push Notifications"
          desc="Instant alerts to your browser or device"
          checked={notifications.push}
          onChange={() => toggleNotification("push")}
        />
        <NotificationRow
          icon={<TrendingUp size={16} />} label="Price Alerts"
          desc="Notify when a tracked commodity hits your target"
          checked={notifications.priceAlerts}
          onChange={() => toggleNotification("priceAlerts")}
        />
        <NotificationRow
          icon={<Newspaper size={16} />} label="News Digest"
          desc="Curated daily market news to your inbox"
          checked={notifications.newsDigest}
          onChange={() => toggleNotification("newsDigest")}
        />
        <div style={{ paddingTop: "14px" }}>
          <NotificationRow
            icon={<FileText size={16} />} label="Weekly Report"
            desc="Portfolio performance email every Monday"
            checked={notifications.weeklyReport}
            onChange={() => toggleNotification("weeklyReport")}
          />
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Alert Frequency</SectionTitle>
        <div className="ca-grid-3" style={{ gap: "8px" }}>
          {(["realtime", "hourly", "daily"] as const).map((f) => {
            const labels: Record<string, string> = { realtime: "Real-time", hourly: "Hourly", daily: "Daily" };
            const active = notifications.frequency === f;
            return (
              <button
                key={f} type="button"
                onClick={() => setNotificationFrequency(f)}
                style={{
                  padding: "10px", borderRadius: "8px",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent)15" : "var(--bg-primary)",
                  color: active ? "var(--accent)" : "var(--text-primary)",
                  fontWeight: active ? 700 : 400, fontSize: "13px",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 150ms",
                }}
              >
                {labels[f]}
                {active && <Check size={12} style={{ marginLeft: "6px", verticalAlign: "text-bottom" }} />}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </>
  );
}

// ─── Data & Markets Tab ───────────────────────────────────────────────────────

function DataTab() {
  const { refreshRate, setRefreshRate } = useUserStore();
  const { preferences, setChartType, toggleIndicator, setShowGrid, setShowVolume, setShowTooltip } =
    useChartPreferencesStore();

  return (
    <>
      <SettingsCard>
        <SectionTitle>Live Data</SectionTitle>
        <SelectField<string>
          label="Data Refresh Rate"
          value={String(refreshRate)}
          options={REFRESH_RATES.map((r) => ({ value: String(r.value), label: r.label }))}
          onChange={(v) => setRefreshRate(Number(v))}
          icon={<RefreshCw size={13} />}
        />
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Chart Defaults</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <SelectField<string>
            label="Default Chart Type"
            value={preferences.chartType}
            options={CHART_TYPE_OPTIONS}
            onChange={(v) => setChartType(v as "line" | "area" | "candlestick")}
          />

          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
              Technical Indicators
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {INDICATOR_OPTIONS.map((ind) => {
                const active = preferences.indicators.includes(ind.value as never);
                return (
                  <button
                    key={ind.value} type="button"
                    onClick={() => toggleIndicator(ind.value as never)}
                    style={{
                      padding: "6px 14px", borderRadius: "20px",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      background: active ? "var(--accent)" : "var(--bg-primary)",
                      color: active ? "white" : "var(--text-primary)",
                      fontSize: "12px", fontWeight: active ? 700 : 400,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 150ms",
                    }}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ca-grid-3">
            {[
              { label: "Show Grid", checked: preferences.showGrid, fn: setShowGrid },
              { label: "Show Volume", checked: preferences.showVolume, fn: setShowVolume },
              { label: "Show Tooltip", checked: preferences.showTooltip, fn: setShowTooltip },
            ].map(({ label, checked, fn }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{label}</span>
                <Toggle on={checked} onChange={fn} />
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { sessionTimeout, twoFactor, setSessionTimeout, setTwoFactor, resetAllSettings } = useUserStore();
  const [showReset, setShowReset] = useState(false);

  const FAKE_SESSIONS = [
    { id: "s1", device: "Chrome — Windows", location: "Mumbai, IN", time: "Now", current: true },
    { id: "s2", device: "Safari — iPhone 15", location: "Mumbai, IN", time: "2 days ago", current: false },
    { id: "s3", device: "Firefox — macOS", location: "New York, US", time: "5 days ago", current: false },
  ];

  return (
    <>
      <SettingsCard>
        <SectionTitle>Authentication</SectionTitle>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 20px" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <KeyRound size={15} style={{ color: "var(--accent)" }} />
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Protect your account with an authenticator app
            </div>
          </div>
          <Toggle on={twoFactor} onChange={setTwoFactor} />
        </div>

        <SelectField<string>
          label="Session Timeout"
          value={String(sessionTimeout)}
          options={SESSION_TIMEOUTS.map((t) => ({ value: String(t.value), label: t.label }))}
          onChange={(v) => setSessionTimeout(Number(v))}
          icon={<Clock size={13} />}
        />
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Active Sessions</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAKE_SESSIONS.map((s) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px", borderRadius: "8px",
              background: s.current ? "var(--accent)0d" : "var(--bg-primary)",
              border: `1px solid ${s.current ? "var(--accent)33" : "var(--border)"}`,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {s.device}
                  {s.current && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, background: "var(--accent)",
                      color: "white", padding: "1px 7px", borderRadius: "10px",
                    }}>CURRENT</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {s.location} · {s.time}
                </div>
              </div>
              {!s.current && (
                <button type="button" style={{
                  fontSize: "12px", color: "rgb(239,68,68)", background: "none",
                  border: "1px solid rgba(239,68,68,.4)", borderRadius: "6px",
                  padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
                }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Account Data</SectionTitle>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button type="button" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            border: "1px solid var(--border)", background: "var(--bg-primary)",
            color: "var(--text-primary)", fontSize: "13px", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <Download size={14} /> Export Data
          </button>
          <button type="button" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            border: "1px solid var(--border)", background: "var(--bg-primary)",
            color: "var(--text-primary)", fontSize: "13px", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </SettingsCard>

      <SettingsCard danger>
        <SectionTitle>Danger Zone</SectionTitle>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Clears all saved settings and reloads the app. This cannot be undone.
        </p>
        {!showReset ? (
          <button type="button" onClick={() => setShowReset(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            border: "1px solid rgba(239,68,68,.5)", background: "transparent",
            color: "rgb(239,68,68)", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <Trash2 size={14} /> Reset All Settings
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Are you absolutely sure?
            </span>
            <button type="button" onClick={() => setShowReset(false)} style={{
              padding: "7px 14px", borderRadius: "7px",
              background: "var(--bg-primary)", color: "var(--text-primary)",
              border: "1px solid var(--border)", fontSize: "13px",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Cancel
            </button>
            <button type="button" onClick={resetAllSettings} style={{
              padding: "7px 14px", borderRadius: "7px",
              background: "rgb(239,68,68)", color: "white",
              border: "none", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Yes, Reset
            </button>
          </div>
        )}
      </SettingsCard>
    </>
  );
}

// ─── Main Settings View ───────────────────────────────────────────────────────


export function SettingsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const initFromStorage = useUserStore((s) => s.initFromStorage);

  useEffect(() => { initFromStorage(); }, [initFromStorage]);

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    appearance: <AppearanceTab />,
    notifications: <NotificationsTab />,
    data: <DataTab />,
    security: <SecurityTab />,
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0", padding: "40px 24px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", fontSize: "14px",
            padding: "0 0 20px 0", fontFamily: "inherit"
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Manage your account, appearance, and market preferences
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: "4px", padding: "6px",
        background: "var(--bg-card)", borderRadius: "12px",
        border: "1px solid var(--border)", marginBottom: "24px",
        overflowX: "auto",
      }}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 16px", borderRadius: "8px",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "white" : "var(--text-secondary)",
                border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap", transition: "all 150ms",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div key={activeTab}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
