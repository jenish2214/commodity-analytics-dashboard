"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  BarChart3,
  Shield,
  Sparkles,
  Settings,
  Newspaper,
  TrendingUp,
  Command,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

const EXTRA = [
  { href: "/market-news", label: "Market news", icon: Newspaper },
  { href: "/indices", label: "Market indices", icon: TrendingUp },
];

const ICONS: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  LineChart,
  Briefcase,
  BarChart3,
  Shield,
  Sparkles,
  Settings,
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const nav = NAV_ITEMS.map((n) => ({
      href: n.href,
      label: n.label,
      Icon: ICONS[n.icon] ?? LayoutDashboard,
    }));
    const all = [
      ...nav,
      ...EXTRA.map((e) => ({ ...e, Icon: e.icon })),
    ];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (i) =>
        i.label.toLowerCase().includes(query) ||
        i.href.toLowerCase().includes(query)
    );
  }, [q]);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQ("");
    },
    [router, onClose]
  );

  useEffect(() => {
    if (open) {
      setActive(0);
      setQ("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        go(items[active].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, go, onClose]);

  if (!open) return null;

  return (
    <div className="ws-cmd-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ws-cmd-panel"
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ws-cmd-head">
          <Command size={18} className="ws-cmd-head__icon" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            className="ws-cmd-input"
            placeholder="Go to page…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
          <kbd className="ws-cmd-kbd">esc</kbd>
        </div>
        <ul className="ws-cmd-list" role="listbox">
          {items.length === 0 ? (
            <li className="ws-cmd-empty">No matches</li>
          ) : (
            items.map((item, i) => {
              const I = item.Icon;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`ws-cmd-item${i === active ? " ws-cmd-item--active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.href)}
                  >
                    <I size={16} strokeWidth={2} aria-hidden />
                    <span>{item.label}</span>
                    <span className="ws-cmd-hint">{item.href}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
