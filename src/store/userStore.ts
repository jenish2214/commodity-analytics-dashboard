import { create } from "zustand";
import type { NotificationPrefs, UserProfile } from "@/types/models";
import { defaultUser } from "@/lib/mock-data";

export type ThemeMode = "light" | "dark";

type UserState = {
  profile: UserProfile;
  theme: ThemeMode;
  notifications: NotificationPrefs;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  setNotifications: (prefs: Partial<NotificationPrefs>) => void;
  hydrateFromStorage: () => void;
};

const STORAGE_KEY = "ca-dashboard-user";

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    name: defaultUser.name,
    email: defaultUser.email,
    plan: defaultUser.plan,
  },
  theme: "light",
  notifications: {
    emailAlerts: true,
    priceAlerts: true,
  },
  hydrated: false,
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...parsed, theme })
      );
    } catch {
      /* ignore */
    }
  },
  setProfile: (profile) =>
    set((s) => ({
      profile: { ...s.profile, ...profile },
    })),
  setNotifications: (prefs) => {
    set((s) => {
      const next = { ...s.notifications, ...prefs };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...parsed,
            notifications: next,
            theme: s.theme,
            profile: s.profile,
          })
        );
      } catch {
        /* ignore */
      }
      return { notifications: next };
    });
  },
  hydrateFromStorage: () => {
    if (get().hydrated) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        if (typeof document !== "undefined") {
          document.documentElement.dataset.theme = get().theme;
        }
        return;
      }
      const data = JSON.parse(raw) as {
        theme?: ThemeMode;
        profile?: UserProfile;
        notifications?: NotificationPrefs;
      };
      set({
        theme: data.theme ?? "light",
        profile: data.profile
          ? { ...get().profile, ...data.profile }
          : get().profile,
        notifications: data.notifications
          ? { ...get().notifications, ...data.notifications }
          : get().notifications,
        hydrated: true,
      });
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = data.theme ?? "light";
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
