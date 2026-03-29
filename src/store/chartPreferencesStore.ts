import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChartType = "line" | "candlestick" | "area";
export type IndicatorType = "price" | "volume" | "sma" | "ema" | "rsi" | "macd" | "bollinger";

interface ChartPreferences {
  chartType: ChartType;
  indicators: IndicatorType[];
  showGrid: boolean;
  showVolume: boolean;
  showTooltip: boolean;
  animationDuration: number;
  theme: "light" | "dark";
  colors: {
    primary: string;
    secondary: string;
    volume: string;
    grid: string;
    text: string;
  };
}

interface ChartState {
  preferences: ChartPreferences;
  setChartType: (type: ChartType) => void;
  toggleIndicator: (indicator: IndicatorType) => void;
  setIndicators: (indicators: IndicatorType[]) => void;
  setShowGrid: (show: boolean) => void;
  setShowVolume: (show: boolean) => void;
  setShowTooltip: (show: boolean) => void;
  setAnimationDuration: (duration: number) => void;
  setTheme: (theme: "light" | "dark") => void;
  setColors: (colors: Partial<ChartPreferences["colors"]>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: ChartPreferences = {
  chartType: "line",
  indicators: ["price", "volume"],
  showGrid: true,
  showVolume: true,
  showTooltip: true,
  animationDuration: 600,
  theme: "dark",
  colors: {
    primary: "#0b1f33",
    secondary: "#16a34a",
    volume: "#64748b",
    grid: "#e2e8f0",
    text: "#64748b",
  },
};

export const useChartPreferencesStore = create<ChartState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,

      setChartType: (type) =>
        set((state) => ({
          preferences: { ...state.preferences, chartType: type },
        })),

      toggleIndicator: (indicator) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            indicators: state.preferences.indicators.includes(indicator)
              ? state.preferences.indicators.filter((i) => i !== indicator)
              : [...state.preferences.indicators, indicator],
          },
        })),

      setIndicators: (indicators) =>
        set((state) => ({
          preferences: { ...state.preferences, indicators },
        })),

      setShowGrid: (show) =>
        set((state) => ({
          preferences: { ...state.preferences, showGrid: show },
        })),

      setShowVolume: (show) =>
        set((state) => ({
          preferences: { ...state.preferences, showVolume: show },
        })),

      setShowTooltip: (show) =>
        set((state) => ({
          preferences: { ...state.preferences, showTooltip: show },
        })),

      setAnimationDuration: (duration) =>
        set((state) => ({
          preferences: { ...state.preferences, animationDuration: duration },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setColors: (colors) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            colors: { ...state.preferences.colors, ...colors },
          },
        })),

      resetPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: "chart-preferences",
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
