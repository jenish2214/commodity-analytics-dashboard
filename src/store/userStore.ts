import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CurrencyCode, DashboardNotifications } from "@/types/models";

// ─── Constants ──────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;
export type Timezone = (typeof TIMEZONES)[number];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese" },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const FONT_SIZES = ["sm", "md", "lg"] as const;
export type FontSizeOption = (typeof FONT_SIZES)[number];

export const ACCENT_COLORS = [
  { id: "emerald", value: "#10b981" },
  { id: "blue",    value: "#3b82f6" },
  { id: "violet",  value: "#8b5cf6" },
  { id: "rose",    value: "#f43f5e" },
  { id: "amber",   value: "#f59e0b" },
  { id: "cyan",    value: "#06b6d4" },
] as const;
export type AccentColorId = (typeof ACCENT_COLORS)[number]["id"];

export const REFRESH_RATES = [
  { value: 15,   label: "15 seconds" },
  { value: 30,   label: "30 seconds" },
  { value: 60,   label: "1 minute" },
  { value: 300,  label: "5 minutes" },
  { value: 900,  label: "15 minutes" },
] as const;

export const SESSION_TIMEOUTS = [
  { value: 15,  label: "15 minutes" },
  { value: 30,  label: "30 minutes" },
  { value: 60,  label: "1 hour" },
  { value: 240, label: "4 hours" },
  { value: 0,   label: "Never" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currencySymbolFor(code: CurrencyCode): string {
  return CURRENCY_SYMBOL[code];
}

function applyThemeToDom(theme: "light" | "dark" | "navy"): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("dashboard_theme", theme); } catch { /* */ }
}

function applyAccentColor(color: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent", color);
}

function applyFontSize(size: FontSizeOption): void {
  if (typeof document === "undefined") return;
  const map: Record<FontSizeOption, string> = { sm: "13px", md: "15px", lg: "17px" };
  document.documentElement.style.fontSize = map[size];
}

function syncAuxiliaryStorage(state: {
  theme: "light" | "dark" | "navy";
  currency: CurrencyCode;
  name: string;
  email: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("dashboard_theme",    state.theme);
    localStorage.setItem("dashboard_currency", state.currency);
    localStorage.setItem("dashboard_profile",  JSON.stringify({ name: state.name, email: state.email }));
  } catch { /* */ }
}

// ─── Extended Notifications ───────────────────────────────────────────────────

export interface ExtendedNotifications extends DashboardNotifications {
  newsDigest: boolean;
  weeklyReport: boolean;
  frequency: "realtime" | "hourly" | "daily";
}

// ─── State Types ─────────────────────────────────────────────────────────────

type UserPersistState = {
  // Profile
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string | null;          // base64 data-url or null
  // Localisation
  timezone: Timezone;
  language: LanguageCode;
  // App
  theme: "light" | "dark" | "navy";
  accentColorId: AccentColorId;
  fontSize: FontSizeOption;
  compactMode: boolean;
  currency: CurrencyCode;
  currencySymbol: string;
  // Notifications
  notifications: ExtendedNotifications;
  // Data / Markets
  refreshRate: number;            // seconds
  // Security
  sessionTimeout: number;         // minutes (0 = never)
  twoFactor: boolean;
  // Layout
  sidebarOpen: boolean;
};

type UserActions = {
  // Profile
  updateProfile: (p: Partial<Pick<UserPersistState, "name" | "email" | "phone" | "bio">>) => void;
  setAvatar: (dataUrl: string | null) => void;
  // Localisation
  setTimezone: (tz: Timezone) => void;
  setLanguage: (lang: LanguageCode) => void;
  // Appearance
  setTheme: (theme: "light" | "dark" | "navy") => void;
  setAccentColor: (id: AccentColorId) => void;
  setFontSize: (size: FontSizeOption) => void;
  setCompactMode: (on: boolean) => void;
  // Currency
  setCurrency: (currency: CurrencyCode) => void;
  // Notifications
  toggleNotification: (key: keyof DashboardNotifications | "newsDigest" | "weeklyReport") => void;
  setNotificationFrequency: (freq: ExtendedNotifications["frequency"]) => void;
  // Data
  setRefreshRate: (secs: number) => void;
  // Security
  setSessionTimeout: (mins: number) => void;
  setTwoFactor: (on: boolean) => void;
  // Layout
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  // Global
  initFromStorage: () => void;
  resetAllSettings: () => void;
};

export type UserStore = UserPersistState & UserActions;

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultNotifications: ExtendedNotifications = {
  email: true,
  push: false,
  priceAlerts: true,
  newsDigest: false,
  weeklyReport: true,
  frequency: "realtime",
};

const defaultState: UserPersistState = {
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "",
  bio: "",
  avatar: null,
  timezone: "America/New_York",
  language: "en",
  theme: "dark",
  accentColorId: "emerald",
  fontSize: "md",
  compactMode: false,
  currency: "USD",
  currencySymbol: "$",
  notifications: { ...defaultNotifications },
  refreshRate: 60,
  sessionTimeout: 30,
  twoFactor: false,
  sidebarOpen: true,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      updateProfile: (p) => {
        set((s) => ({
          name:  p.name  ?? s.name,
          email: p.email ?? s.email,
          phone: p.phone ?? s.phone,
          bio:   p.bio   ?? s.bio,
        }));
        syncAuxiliaryStorage(get());
      },

      setAvatar: (dataUrl) => set({ avatar: dataUrl }),

      setTimezone: (timezone) => set({ timezone }),

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => {
        set({ theme });
        applyThemeToDom(theme);
        syncAuxiliaryStorage({ ...get(), theme });
      },

      setAccentColor: (id) => {
        const found = ACCENT_COLORS.find((c) => c.id === id);
        if (!found) return;
        set({ accentColorId: id });
        applyAccentColor(found.value);
      },

      setFontSize: (size) => {
        set({ fontSize: size });
        applyFontSize(size);
      },

      setCompactMode: (on) => set({ compactMode: on }),

      setCurrency: (currency) => {
        const currencySymbol = currencySymbolFor(currency);
        set({ currency, currencySymbol });
        try { localStorage.setItem("dashboard_currency", currency); } catch { /* */ }
        syncAuxiliaryStorage(get());
      },

      toggleNotification: (key) =>
        set((s) => ({
          notifications: {
            ...s.notifications,
            [key]: !s.notifications[key as keyof ExtendedNotifications],
          },
        })),

      setNotificationFrequency: (freq) =>
        set((s) => ({
          notifications: { ...s.notifications, frequency: freq },
        })),

      setRefreshRate: (secs) => set({ refreshRate: secs }),

      setSessionTimeout: (mins) => set({ sessionTimeout: mins }),

      setTwoFactor: (on) => set({ twoFactor: on }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      initFromStorage: () => {
        const st = get();
        applyThemeToDom(st.theme);
        applyFontSize(st.fontSize);
        const accent = ACCENT_COLORS.find((c) => c.id === st.accentColorId);
        if (accent) applyAccentColor(accent.value);
        syncAuxiliaryStorage(st);
      },

      resetAllSettings: () => {
        try {
          ["dashboard_settings", "dashboard_theme", "dashboard_currency",
            "dashboard_profile", "dashboard_portfolio", "ca-dashboard-user",
          ].forEach((k) => localStorage.removeItem(k));
        } catch { /* */ }
        if (typeof window !== "undefined") window.location.reload();
      },
    }),
    {
      name: "dashboard_settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        name:           state.name,
        email:          state.email,
        phone:          state.phone,
        bio:            state.bio,
        avatar:         state.avatar,
        timezone:       state.timezone,
        language:       state.language,
        theme:          state.theme,
        accentColorId:  state.accentColorId,
        fontSize:       state.fontSize,
        compactMode:    state.compactMode,
        currency:       state.currency,
        currencySymbol: state.currencySymbol,
        notifications:  state.notifications,
        refreshRate:    state.refreshRate,
        sessionTimeout: state.sessionTimeout,
        twoFactor:      state.twoFactor,
        sidebarOpen:    state.sidebarOpen,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<UserPersistState> | undefined;
        if (!p || typeof p !== "object") return current;
        const currency = (p.currency ?? current.currency) as CurrencyCode;
        return {
          ...current,
          ...p,
          currency,
          currencySymbol: currencySymbolFor(currency),
          notifications: {
            ...current.notifications,
            ...(p.notifications ?? {}),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyThemeToDom(state.theme);
        applyFontSize(state.fontSize);
        const accent = ACCENT_COLORS.find((c) => c.id === state.accentColorId);
        if (accent) applyAccentColor(accent.value);
        syncAuxiliaryStorage(state);
      },
    }
  )
);
