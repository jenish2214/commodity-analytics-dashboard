import { create } from "zustand";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  image?: string;
  category?: string;
}

interface NewsState {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
  fetchNews: () => Promise<void>;
  refreshNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  news: [],
  loading: false,
  error: null,
  lastUpdate: 0,

  fetchNews: async () => {
    set({ loading: true, error: null });
    
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      
      if (!res.ok) {
        throw new Error("Failed to fetch news");
      }
      
      const data = await res.json();
      const newsItems = data.articles || [];
      
      set({
        news: newsItems,
        loading: false,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch news:', error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch news",
        loading: false,
      });
    }
  },

  refreshNews: async () => {
    const { lastUpdate } = get();
    const now = Date.now();
    
    // Only refresh if at least 30 seconds have passed
    if (now - lastUpdate < 30000) {
      return;
    }
    
    await get().fetchNews();
  },
}));
