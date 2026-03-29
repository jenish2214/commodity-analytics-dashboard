import type { DashboardFont } from "@/types/models";

const MAP: Record<DashboardFont, string> = {
  Inter: "Inter:wght@400;500;600;700",
  Roboto: "Roboto:wght@400;500;700",
  Poppins: "Poppins:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  "JetBrains Mono": "JetBrains+Mono:wght@400;500;700",
};

export function googleFontHref(font: DashboardFont): string {
  const family = MAP[font];
  return `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
}

export function fontFamilyCss(font: DashboardFont): string {
  const quoted =
    font === "JetBrains Mono"
      ? '"JetBrains Mono"'
      : font === "Playfair Display"
        ? '"Playfair Display"'
        : font;
  return `${quoted}, system-ui, sans-serif`;
}
