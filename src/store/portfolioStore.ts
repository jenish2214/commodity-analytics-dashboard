import { create } from "zustand";
import type {
  AllocationSlice,
  PortfolioHolding,
  PortfolioItem,
  PortfolioItemStatus,
} from "@/types/models";

type Totals = { value: number; pnl: number };

const STORAGE_KEY = "dashboard_portfolio";

function loadItemsFromStorage(): PortfolioItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as PortfolioItem[];
  } catch {
    return [];
  }
}

function saveItemsToStorage(items: PortfolioItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

type PortfolioState = {
  holdings: PortfolioHolding[];
  allocation: AllocationSlice[];
  totals: Totals;
  loading: boolean;
  items: PortfolioItem[];
  fetchPortfolio: () => Promise<void>;
  loadItemsFromStorage: () => void;
  addItem: (
    item: Omit<PortfolioItem, "id" | "dateAdded">
  ) => void;
  updateItem: (id: string, updates: Partial<PortfolioItem>) => void;
  removeItem: (id: string) => void;
  toggleStatus: (id: string) => void;
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  allocation: [],
  totals: { value: 0, pnl: 0 },
  loading: false,
  items: [],

  fetchPortfolio: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const data = (await res.json()) as {
        holdings: PortfolioHolding[];
        allocation: AllocationSlice[];
        totals: Totals;
      };
      set({
        holdings: data.holdings,
        allocation: data.allocation,
        totals: data.totals,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  loadItemsFromStorage: () => {
    const items = loadItemsFromStorage();
    set({ items });
  },

  addItem: (item) => {
    const next: PortfolioItem = {
      ...item,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    set((s) => {
      const items = [...s.items, next];
      saveItemsToStorage(items);
      return { items };
    });
  },

  updateItem: (id, updates) => {
    set((s) => {
      const items = s.items.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      saveItemsToStorage(items);
      return { items };
    });
  },

  removeItem: (id) => {
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      saveItemsToStorage(items);
      return { items };
    });
  },

  toggleStatus: (id) => {
    set((s) => {
      const items: PortfolioItem[] = s.items.map((i) =>
        i.id === id
          ? {
              ...i,
              status:
                (i.status === "Open" ? "Closed" : "Open") as PortfolioItemStatus,
            }
          : i
      );
      saveItemsToStorage(items);
      return { items };
    });
  },
}));

/** Call once on client to hydrate CRUD items */
export function initPortfolioItems(): void {
  usePortfolioStore.getState().loadItemsFromStorage();
}
