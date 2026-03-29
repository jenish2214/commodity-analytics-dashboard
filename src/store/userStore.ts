import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CurrencyCode,
  DashboardFont,
  DashboardNotifications,
} from "@/types/models";

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

function currencySymbolFor(code: CurrencyCode): string {
  return CURRENCY_SYMBOL[code];
}

function applyThemeToDom(theme: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("dashboard_theme", theme);
  } catch {
    /* ignore */
  }
}

function syncAuxiliaryStorage(state: {
  theme: "light" | "dark";
  font: DashboardFont;
  currency: CurrencyCode;
  name: string;
  email: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("dashboard_theme", state.theme);
    localStorage.setItem("dashboard_font", state.font);
    localStorage.setItem("dashboard_currency", state.currency);
    localStorage.setItem(
      "dashboard_profile",
      JSON.stringify({ name: state.name, email: state.email })
    );
  } catch {
    /* ignore */
  }
}

type UserPersistState = {
  name: string;
  email: string;
  theme: "light" | "dark";
  font: DashboardFont;
  currency: CurrencyCode;
  currencySymbol: string;
  notifications: DashboardNotifications;
  sidebarOpen: boolean;
};

type UserActions = {
  setTheme: (theme: "light" | "dark") => void;
  setFont: (font: DashboardFont) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  updateProfile: (p: { name?: string; email?: string }) => void;
  toggleNotification: (key: keyof DashboardNotifications) => void;
  initFromStorage: () => void;
  resetAllSettings: () => void;
};

export type UserStore = UserPersistState & UserActions;

const defaultNotifications: DashboardNotifications = {
  email: true,
  push: false,
  priceAlerts: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      name: "Alex Morgan",
      email: "alex@example.com",
      theme: "dark",
      font: "Inter",
      currency: "USD",
      currencySymbol: currencySymbolFor("USD"),
      notifications: { ...defaultNotifications },
      sidebarOpen: true,

      setTheme: (theme) => {
        set({ theme });
        applyThemeToDom(theme);
        syncAuxiliaryStorage({ ...get(), theme });
      },

      setFont: (font) => {
        set({ font });
        try {
          localStorage.setItem("dashboard_font", font);
        } catch {
          /* ignore */
        }
        syncAuxiliaryStorage(get());
      },

      setCurrency: (currency) => {
        const currencySymbol = currencySymbolFor(currency);
        set({ currency, currencySymbol });
        try {
          localStorage.setItem("dashboard_currency", currency);
        } catch {
          /* ignore */
        }
        syncAuxiliaryStorage(get());
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      updateProfile: (p) => {
        set((s) => ({
          name: p.name ?? s.name,
          email: p.email ?? s.email,
        }));
        syncAuxiliaryStorage(get());
      },

      toggleNotification: (key) => {
        set((s) => ({
          notifications: {
            ...s.notifications,
            [key]: !s.notifications[key],
          },
        }));
      },

      initFromStorage: () => {
        const st = get();
        applyThemeToDom(st.theme);
        syncAuxiliaryStorage(st);
      },

      resetAllSettings: () => {
        try {
          localStorage.removeItem("dashboard_settings");
          localStorage.removeItem("dashboard_theme");
          localStorage.removeItem("dashboard_font");
          localStorage.removeItem("dashboard_currency");
          localStorage.removeItem("dashboard_profile");
          localStorage.removeItem("dashboard_portfolio");
          localStorage.removeItem("ca-dashboard-user");
        } catch {
          /* ignore */
        }
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      },
    }),
    {
      name: "dashboard_settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        theme: state.theme,
        font: state.font,
        currency: state.currency,
        currencySymbol: state.currencySymbol,
        notifications: state.notifications,
        sidebarOpen: state.sidebarOpen,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<UserPersistState> | undefined;
        if (!p || typeof p !== "object") return current;
        const currency = p.currency ?? current.currency;
        return {
          ...current,
          ...p,
          currency,
          currencySymbol: currencySymbolFor(currency as CurrencyCode),
          notifications: {
            ...current.notifications,
            ...(p.notifications ?? {}),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDom(state.theme);
          syncAuxiliaryStorage(state);
        }
      },
    }
  )
);
