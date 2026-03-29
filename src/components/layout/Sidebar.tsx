"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Brain,
  Briefcase,
  FileText,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  X,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useUserStore } from "@/store/userStore";

const NAV_ICONS = [
  LayoutDashboard,
  BarChart2,
  Briefcase,
  Brain,
  Newspaper,
  FileText,
  Settings,
] as const;

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUserStore((s) => s.sidebarOpen);
  const toggleSidebar = useUserStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUserStore((s) => s.setSidebarOpen);
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeOnNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ca-sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </button>

      <aside
        className="ca-sidebar"
        data-open={sidebarOpen ? "true" : "false"}
        aria-label="Sidebar navigation"
      >
        <div className="ca-sidebar__head">
          <button
            type="button"
            className="ca-sidebar__hamburger"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
          <div className="ca-sidebar__logo">Commodity Analytics</div>
        </div>

        <nav className="ca-nav" aria-label="Primary">
          {NAV_ITEMS.map((item, index) => {
            const active = pathActive(pathname, item.href);
            const Icon = NAV_ICONS[index] ?? LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "ca-nav__link ca-nav__link--active ca-nav__link--with-icon"
                    : "ca-nav__link ca-nav__link--with-icon"
                }
                onClick={closeOnNavigate}
              >
                <Icon size={18} strokeWidth={2} aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ca-sidebar__user">
          <div className="ca-sidebar__avatar" aria-hidden>
            {initials}
          </div>
          <div className="ca-sidebar__user-text">
            <div className="ca-sidebar__user-name">{name}</div>
            <div className="ca-sidebar__user-email">{email}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
