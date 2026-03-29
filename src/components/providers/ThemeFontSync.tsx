"use client";

import { useEffect, useLayoutEffect } from "react";
import { fontFamilyCss, googleFontHref } from "@/lib/fontUrls";
import { initPortfolioItems } from "@/store/portfolioStore";
import { useUserStore } from "@/store/userStore";
import type { DashboardFont } from "@/types/models";

const LINK_ID = "dashboard-google-font";

export function ThemeFontSync() {
  const theme = useUserStore((s) => s.theme);
  const font = useUserStore((s) => s.font);
  const initFromStorage = useUserStore((s) => s.initFromStorage);

  useLayoutEffect(() => {
    initFromStorage();
    initPortfolioItems();
  }, [initFromStorage]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    const href = googleFontHref(font as DashboardFont);
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
    const family = fontFamilyCss(font as DashboardFont);
    document.documentElement.style.setProperty("--dashboard-font-family", family);
    document.documentElement.style.fontFamily = family;
    if (document.body) {
      document.body.style.fontFamily = family;
    }
  }, [font]);

  return null;
}
