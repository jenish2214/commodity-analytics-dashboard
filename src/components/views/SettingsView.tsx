"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Palette,
  Bell,
  BarChart2,
  Shield,
  Camera,
  Check,
  ChevronDown,
  Globe,
  Clock,
  RefreshCw,
  KeyRound,
  LogOut,
  Download,
  Trash2,
  X,
  Mail,
  Smartphone,
  TrendingUp,
  Newspaper,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useChartPreferencesStore } from "@/store/chartPreferencesStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import type { CurrencyCode } from "@/types/models";
import {
  ACCENT_COLORS,
  FONT_SIZES,
  LANGUAGES,
  REFRESH_RATES,
  SESSION_TIMEOUTS,
  TIMEZONES,
  type AccentColorId,
  type FontSizeOption,
  type LanguageCode,
  type Timezone,
} from "@/store/userStore";
import s from "./SettingsView.module.css";

type TabId = "profile" | "appearance" | "notifications" | "data" | "security";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
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

function Toggle({ on, onChange, id }: { on: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`${s.toggle} ${on ? s.toggleOn : ""}`}
    >
      <span className={`${s.knob} ${on ? s.knobOn : ""}`} />
    </button>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className={s.fieldCol}>
      <span className={s.label}>
        {icon ? <span style={{ marginRight: 6, verticalAlign: "middle" }}>{icon}</span> : null}
        {label}
      </span>
      <div className={s.selectWrap}>
        <select className={s.select} value={value} onChange={(e) => onChange(e.target.value as T)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={s.chevron} aria-hidden />
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className={s.fieldCol}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder ?? ""}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={s.input}
      />
    </div>
  );
}

function exportDashboardData(): void {
  const user = useUserStore.getState();
  const portfolio = usePortfolioStore.getState();
  const charts = useChartPreferencesStore.getState();
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      timezone: user.timezone,
      language: user.language,
      currency: user.currency,
      theme: user.theme,
      accentColorId: user.accentColorId,
      fontSize: user.fontSize,
      compactMode: user.compactMode,
      notifications: user.notifications,
      refreshRate: user.refreshRate,
      sessionTimeout: user.sessionTimeout,
      twoFactor: user.twoFactor,
    },
    chartDefaults: charts.preferences,
    portfolio: {
      items: portfolio.items,
      holdings: portfolio.holdings,
      allocation: portfolio.allocation,
      totals: portfolio.totals,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metals-dashboard-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function ProfileTab() {
  const { name, email, phone, bio, avatar, timezone, language, updateProfile, setAvatar, setTimezone, setLanguage } =
    useUserStore();

  const [local, setLocal] = useState({ name, email, phone, bio });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal({ name, email, phone, bio });
  }, [name, email, phone, bio]);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(local);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Avatar must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className={s.card}>
        <h3 className={s.sectionTitle}>Personal information</h3>
        <div className={s.avatarBlock}>
          <div className={s.avatarRing}>
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={72}
                height={72}
                unoptimized
                className={s.avatarImg}
              />
            ) : (
              <div className={s.avatarFallback}>{initials}</div>
            )}
            <button type="button" className={s.avatarEdit} onClick={() => fileRef.current?.click()} title="Upload photo">
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
          <div>
            <div className={s.avatarMetaName}>{name}</div>
            <div className={s.avatarMetaEmail}>{email}</div>
            {avatar ? (
              <button type="button" className={s.linkMute} onClick={() => setAvatar(null)}>
                <X size={11} aria-hidden /> Remove photo
              </button>
            ) : null}
          </div>
        </div>

        <div className="ca-grid-2">
          <InputField id="s-name" label="Full name" value={local.name} onChange={(v) => setLocal({ ...local, name: v })} />
          <InputField
            id="s-email"
            label="Email"
            value={local.email}
            onChange={(v) => setLocal({ ...local, email: v })}
            type="email"
          />
          <InputField
            id="s-phone"
            label="Phone"
            value={local.phone}
            onChange={(v) => setLocal({ ...local, phone: v })}
            placeholder="+1 555 000 0000"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="s-bio" className={s.label}>
            Bio
          </label>
          <textarea
            id="s-bio"
            value={local.bio}
            maxLength={200}
            placeholder="Short professional bio…"
            onChange={(e) => setLocal({ ...local, bio: e.target.value })}
            rows={3}
            className={s.textarea}
          />
          <div className={s.bioCount}>{local.bio.length}/200</div>
        </div>

        <div className={s.rowEnd}>
          <button type="button" className={s.primaryBtn} onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <Check size={14} /> Saved
              </>
            ) : saving ? (
              "Saving…"
            ) : (
              "Save profile"
            )}
          </button>
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Localisation</h3>
        <div className="ca-grid-2">
          <SelectField<Timezone>
            label="Timezone"
            value={timezone}
            options={TIMEZONES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
            onChange={setTimezone}
            icon={<Clock size={13} />}
          />
          <SelectField<LanguageCode>
            label="Language"
            value={language}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            onChange={setLanguage}
            icon={<Globe size={13} />}
          />
        </div>
      </div>
    </>
  );
}

function AppearanceTab() {
  const { theme, accentColorId, fontSize, compactMode, currency, setTheme, setAccentColor, setFontSize, setCompactMode, setCurrency } =
    useUserStore();

  const themeOptions: {
    id: "workspace" | "fintech" | "dark" | "light" | "navy";
    label: string;
    bg: string;
    fg: string;
    border: string;
  }[] = [
    {
      id: "workspace",
      label: "Intelligence",
      bg: "#0b1220",
      fg: "#e5e7eb",
      border: "#3b82f6",
    },
    {
      id: "fintech",
      label: "Terminal",
      bg: "#0b1f33",
      fg: "#e8edf3",
      border: "#00c853",
    },
    { id: "dark", label: "Dark", bg: "#0f172a", fg: "#f8fafc", border: "#334155" },
    { id: "light", label: "Light", bg: "#f8fafc", fg: "#0f172a", border: "#cbd5e1" },
    { id: "navy", label: "Navy", bg: "#0a1628", fg: "#e2e8f0", border: "#3b82f6" },
  ];

  return (
    <>
      <div className={s.card}>
        <h3 className={s.sectionTitle}>Theme</h3>
        <div className={s.themeGrid}>
          {themeOptions.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`${s.themeBtn} ${active ? s.themeBtnActive : ""}`}
                style={{ background: t.bg, color: t.fg, borderColor: active ? "var(--accent)" : t.border }}
              >
                <div
                  className={s.themePreview}
                  style={{ background: t.bg, borderColor: t.border, border: `1px solid ${t.border}` }}
                >
                  <span style={{ flex: 1, background: t.border, borderRadius: 2 }} />
                  <span style={{ flex: 2, background: `${t.fg}22`, borderRadius: 2 }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{t.label}</span>
                {active ? <Check size={14} color="var(--accent)" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Accent colour</h3>
        <div className={s.accentRow}>
          {ACCENT_COLORS.map((c) => {
            const active = accentColorId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setAccentColor(c.id as AccentColorId)}
                title={c.id}
                className={`${s.accentDot} ${active ? s.accentDotActive : ""}`}
                style={{ background: c.value }}
              />
            );
          })}
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Display</h3>
        <div className="ca-grid-2">
          <div>
            <div className={s.label} style={{ marginBottom: "0.65rem" }}>
              Font size
            </div>
            <div className={s.fontRow}>
              {FONT_SIZES.map((sz) => {
                const labels: Record<string, string> = { sm: "Small", md: "Medium", lg: "Large" };
                const active = fontSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz as FontSizeOption)}
                    className={`${s.fontChip} ${active ? s.fontChipActive : ""}`}
                  >
                    {labels[sz]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.inlineToggleRow}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>Compact mode</div>
              <div className={s.notifDesc}>Tighter spacing across the dashboard</div>
            </div>
            <Toggle on={compactMode} onChange={setCompactMode} />
          </div>
        </div>

        <div style={{ marginTop: "1.15rem", paddingTop: "1.15rem", borderTop: "1px solid var(--border)" }}>
          <SelectField<CurrencyCode>
            label="Default currency"
            value={currency}
            options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: c.label }))}
            onChange={setCurrency}
          />
        </div>
      </div>
    </>
  );
}

function NotificationRow({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={s.notifRow}>
      <div className={s.notifLeft}>
        <span className={s.notifIcon}>{icon}</span>
        <div>
          <div className={s.notifLabel}>{label}</div>
          <div className={s.notifDesc}>{desc}</div>
        </div>
      </div>
      <Toggle on={checked} onChange={onChange} />
    </div>
  );
}

function NotificationsTab() {
  const { notifications, toggleNotification, setNotificationFrequency } = useUserStore();

  return (
    <>
      <div className={s.card}>
        <h3 className={s.sectionTitle}>Channels</h3>
        <div className={s.pillStack}>
          <NotificationRow
            icon={<Mail size={16} />}
            label="Email alerts"
            desc="Summaries and notable moves in your inbox"
            checked={notifications.email}
            onChange={() => toggleNotification("email")}
          />
          <NotificationRow
            icon={<Smartphone size={16} />}
            label="Push notifications"
            desc="Browser notifications while the app is open"
            checked={notifications.push}
            onChange={() => toggleNotification("push")}
          />
          <NotificationRow
            icon={<TrendingUp size={16} />}
            label="Price alerts"
            desc="When tracked markets cross your thresholds"
            checked={notifications.priceAlerts}
            onChange={() => toggleNotification("priceAlerts")}
          />
          <NotificationRow
            icon={<Newspaper size={16} />}
            label="News digest"
            desc="Periodic headlines bundle"
            checked={notifications.newsDigest}
            onChange={() => toggleNotification("newsDigest")}
          />
          <NotificationRow
            icon={<FileText size={16} />}
            label="Weekly report"
            desc="Portfolio snapshot by email"
            checked={notifications.weeklyReport}
            onChange={() => toggleNotification("weeklyReport")}
          />
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Alert frequency</h3>
        <div className={s.freqGrid}>
          {(["realtime", "hourly", "daily"] as const).map((f) => {
            const labels: Record<string, string> = { realtime: "Real-time", hourly: "Hourly", daily: "Daily" };
            const active = notifications.frequency === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setNotificationFrequency(f)}
                className={`${s.freqBtn} ${active ? s.freqBtnActive : ""}`}
              >
                {labels[f]}
                {active ? <Check size={12} style={{ marginLeft: 6, verticalAlign: "middle" }} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function DataTab() {
  const { refreshRate, setRefreshRate } = useUserStore();
  const { preferences, setChartType, toggleIndicator, setShowGrid, setShowVolume, setShowTooltip } =
    useChartPreferencesStore();

  return (
    <>
      <div className={s.card}>
        <h3 className={s.sectionTitle}>Live data</h3>
        <SelectField<string>
          label="Price refresh interval"
          value={String(refreshRate)}
          options={REFRESH_RATES.map((r) => ({ value: String(r.value), label: r.label }))}
          onChange={(v) => setRefreshRate(Number(v))}
          icon={<RefreshCw size={13} />}
        />
        <p className={s.mutedSmall} style={{ marginTop: "0.75rem", marginBottom: 0 }}>
          Controls how often live commodity quotes poll in the background (minimum 5 seconds).
        </p>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Chart defaults</h3>
        <div className={s.pillStack}>
          <SelectField<string>
            label="Default chart type"
            value={preferences.chartType}
            options={CHART_TYPE_OPTIONS}
            onChange={(v) => setChartType(v as "line" | "area" | "candlestick")}
          />

          <div>
            <div className={s.label} style={{ marginBottom: "0.5rem" }}>
              Technical indicators
            </div>
            <div className={s.indicators}>
              {INDICATOR_OPTIONS.map((ind) => {
                const active = preferences.indicators.includes(ind.value as never);
                return (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => toggleIndicator(ind.value as never)}
                    className={`${s.indChip} ${active ? s.indChipActive : ""}`}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ca-grid-3">
            {[
              { label: "Show grid", checked: preferences.showGrid, fn: setShowGrid },
              { label: "Show volume", checked: preferences.showVolume, fn: setShowVolume },
              { label: "Show tooltip", checked: preferences.showTooltip, fn: setShowTooltip },
            ].map(({ label, checked, fn }) => (
              <div key={label} className={s.inlineToggleRow}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{label}</span>
                <Toggle on={checked} onChange={fn} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type SessionRow = { id: string; device: string; location: string; time: string; current: boolean };

const SESSION_SEED: SessionRow[] = [
  { id: "s1", device: "Chrome — Windows", location: "This device", time: "Now", current: true },
  { id: "s2", device: "Safari — iPhone", location: "Signed in recently", time: "2 days ago", current: false },
  { id: "s3", device: "Firefox — macOS", location: "Remote", time: "5 days ago", current: false },
];

function SecurityTab() {
  const router = useRouter();
  const { sessionTimeout, twoFactor, setSessionTimeout, setTwoFactor, resetAllSettings } = useUserStore();
  const [showReset, setShowReset] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>(SESSION_SEED);

  const revoke = (id: string) => {
    setSessions((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <>
      <div className={s.card}>
        <h3 className={s.sectionTitle}>Authentication</h3>
        <div className={s.inlineToggleRow} style={{ padding: "0.25rem 0 1rem", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 8 }}>
              <KeyRound size={15} style={{ color: "var(--accent)" }} />
              Two-factor authentication
            </div>
            <div className={s.notifDesc} style={{ marginTop: 6 }}>
              Extra step at sign-in (stored locally for this demo)
            </div>
          </div>
          <Toggle on={twoFactor} onChange={setTwoFactor} />
        </div>

        <SelectField<string>
          label="Session timeout"
          value={String(sessionTimeout)}
          options={SESSION_TIMEOUTS.map((t) => ({ value: String(t.value), label: t.label }))}
          onChange={(v) => setSessionTimeout(Number(v))}
          icon={<Clock size={13} />}
        />
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Active sessions</h3>
        <div className={s.sessionList}>
          {sessions.map((row) => (
            <div key={row.id} className={`${s.sessionCard} ${row.current ? s.sessionCurrent : ""}`}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.8125rem", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {row.device}
                  {row.current ? <span className={s.badgeCurrent}>THIS DEVICE</span> : null}
                </div>
                <div className={s.notifDesc}>
                  {row.location} · {row.time}
                </div>
              </div>
              {!row.current ? (
                <button type="button" className={s.sessionRevoke} onClick={() => revoke(row.id)}>
                  Revoke
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.sectionTitle}>Account data</h3>
        <div className={s.actionBar}>
          <button type="button" className={s.ghostBtn} onClick={exportDashboardData}>
            <Download size={14} /> Export JSON
          </button>
          <button type="button" className={s.ghostBtn} onClick={() => router.push("/logout")}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
        <p className={s.mutedSmall}>
          Export includes profile preferences, chart defaults, and portfolio rows stored in this browser.
        </p>
      </div>

      <div className={`${s.card} ${s.cardDanger}`}>
        <h3 className={s.sectionTitle}>Danger zone</h3>
        <p className={s.mutedSmall}>
          Clears saved settings and portfolio cache keys from this browser, then reloads the app.
        </p>
        {!showReset ? (
          <button type="button" className={s.dangerBtn} onClick={() => setShowReset(true)}>
            <Trash2 size={14} /> Reset all settings
          </button>
        ) : (
          <div className={s.confirmRow}>
            <span className={s.muted}>This cannot be undone.</span>
            <button type="button" className={s.ghostBtn} onClick={() => setShowReset(false)}>
              Cancel
            </button>
            <button type="button" className={s.dangerBtn} onClick={resetAllSettings}>
              Yes, reset
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function SettingsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const initFromStorage = useUserStore((st) => st.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    appearance: <AppearanceTab />,
    notifications: <NotificationsTab />,
    data: <DataTab />,
    security: <SecurityTab />,
  };

  return (
    <div className={s.settingsShell}>
      <button type="button" className={s.back} onClick={() => router.push("/")}>
        <ArrowLeft size={16} aria-hidden /> Back to dashboard
      </button>

      <h1 className={s.headerTitle}>Settings</h1>
      <p className={s.headerLead}>Profile, appearance, notifications, market defaults, and security preferences.</p>

      <div className={s.tabBar} role="tablist" aria-label="Settings sections">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${s.tab} ${active ? s.tabActive : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div key={activeTab} role="tabpanel">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
