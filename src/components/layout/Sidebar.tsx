"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  CircleDollarSign,
  LayoutDashboard,
  LineChart,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  BarChart3,
  Shield,
  Sparkles,
  Settings,
} from "lucide-react";
import { NAV_ITEMS, SIDEBAR_FOOTER_LINKS } from "@/lib/constants";
import { useUserStore } from "@/store/userStore";

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getIcon(iconName: string) {
  const icons: Record<string, typeof LayoutDashboard> = {
    LayoutDashboard,
    LineChart,
    Briefcase,
    BarChart3,
    Shield,
    Sparkles,
    Settings,
    LogOut,
  };
  return icons[iconName] ?? LayoutDashboard;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useUserStore((s) => s.theme);
  const sidebarOpen = useUserStore((s) => s.sidebarOpen);
  const toggleSidebar = useUserStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUserStore((s) => s.setSidebarOpen);
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);

  const isDock = theme === "workspace";

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
      <aside
        className={`ca-sidebar${isDock ? " ca-sidebar--dock" : ""}`}
        data-open={sidebarOpen ? "true" : "false"}
        aria-label="Sidebar navigation"
      >
        <div className="ca-sidebar__head">
          {sidebarOpen && !isDock ? (
            <div className="ca-sidebar__logo">
              <div className="ca-sidebar__logo-icon" aria-hidden>
                <CircleDollarSign size={18} strokeWidth={2.25} />
              </div>
              <span className="ca-sidebar__logo-text">CommodityX</span>
            </div>
          ) : (
            <div className="ca-sidebar__logo-icon" aria-hidden>
              <CircleDollarSign size={18} strokeWidth={2.25} />
            </div>
          )}
          <button
            type="button"
            className="ca-sidebar__collapse"
            onClick={() => toggleSidebar()}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        <nav className="ca-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathActive(pathname, item.href);
            const Icon = getIcon(item.icon);

            return (
              <div key={item.href} className="ca-nav__item-wrapper">
                <Link
                  href={item.href}
                  className={`ca-nav__link ${active ? "ca-nav__link--active" : ""}`}
                  onClick={closeOnNavigate}
                >
                  <Icon size={20} strokeWidth={1.85} aria-hidden />
                  {isDock ? (
                    <>
                      <span className="ca-nav__dock-flyout">{item.label}</span>
                      <span className="ca-nav__dock-mobile-text">{item.label}</span>
                    </>
                  ) : (
                    sidebarOpen && <span>{item.label}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="ca-nav__bottom">
          {SIDEBAR_FOOTER_LINKS.map((item) => {
            const active = pathActive(pathname, item.href);
            const Icon = getIcon(item.icon);

            return (
              <div key={item.href} className="ca-nav__item-wrapper">
                <Link
                  href={item.href}
                  className={`ca-nav__link ca-nav__link--bottom ${active ? "ca-nav__link--active" : ""} ${item.href === "/logout" ? "ca-nav__link--logout" : ""}`}
                  onClick={closeOnNavigate}
                >
                  <Icon size={20} strokeWidth={1.85} aria-hidden />
                  {isDock ? (
                    <>
                      <span className="ca-nav__dock-flyout">{item.label}</span>
                      <span className="ca-nav__dock-mobile-text">{item.label}</span>
                    </>
                  ) : (
                    sidebarOpen && <span>{item.label}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        <button
          className="ca-sidebar__user"
          type="button"
          onClick={() => router.push("/settings")}
        >
          <div className="ca-sidebar__avatar">{initials}</div>
          {sidebarOpen && !isDock ? (
            <div className="ca-sidebar__user-text">
              <div className="ca-sidebar__user-name">{name}</div>
              <div className="ca-sidebar__user-email">{email}</div>
            </div>
          ) : null}
          {isDock ? <span className="ca-nav__dock-flyout">Profile</span> : null}
        </button>
      </aside>
    </>
  );
}
