"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart2,
  Brain,
  Briefcase,
  ChevronDown,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Building,
} from "lucide-react";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { useUserStore } from "@/store/userStore";

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    LayoutDashboard,
    BarChart2,
    Briefcase,
    Brain,
    Newspaper,
    FileText,
    Building,
    HelpCircle,
    LogOut,
  };
  return icons[iconName] || LayoutDashboard;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUserStore((s) => s.sidebarOpen);
  const toggleSidebar = useUserStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUserStore((s) => s.setSidebarOpen);
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: any, e: React.MouseEvent) => {
    if (item.subItems && sidebarOpen) {
      e.preventDefault();
      toggleExpanded(item.href);
    } else if (!item.subItems) {
      closeOnNavigate();
    }
  };

  return (
    <>
      <aside
        className="ca-sidebar"
        data-open={sidebarOpen ? "true" : "false"}
        aria-label="Sidebar navigation"
      >
        {/* Logo + Collapse Button */}
        <div className="ca-sidebar__head" onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
          {sidebarOpen && (
            <div className="ca-sidebar__logo">
              <div className="ca-sidebar__logo-icon">🥇</div>
              <span className="ca-sidebar__logo-text">Metals.dev</span>
            </div>
          )}
          <button
            type="button"
            className="ca-sidebar__collapse"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <Menu size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="ca-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathActive(pathname, item.href);
            const Icon = getIcon(item.icon);
            const isExpanded = expandedItems.has(item.href);
            const isHovered = hoveredItem === item.href;

            return (
              <div key={item.href} className="ca-nav__item-wrapper">
                <Link
                  href={item.href}
                  className={`ca-nav__link ${active ? "ca-nav__link--active" : ""}`}
                  onClick={(e) => handleItemClick(item, e)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                  {sidebarOpen && <span>{item.label}</span>}
                  {sidebarOpen && item.subItems && (
                    <ChevronDown 
                      size={16} 
                      className={`ca-nav__arrow ${isExpanded ? "ca-nav__arrow--open" : ""}`}
                      aria-hidden
                    />
                  )}
                </Link>

                {/* Expanded Sub-items (only when sidebar is expanded) */}
                {sidebarOpen && item.subItems && (
                  <div 
                    className={`ca-nav__subitems ${isExpanded ? "ca-nav__subitems--open" : ""}`}
                    style={{
                      maxHeight: isExpanded ? `${item.subItems.length * 40}px` : "0px",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    {item.subItems.map((subItem: any) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`ca-nav__sublink ${pathActive(pathname, subItem.href) ? "ca-nav__sublink--active" : ""}`}
                        onClick={closeOnNavigate}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Flyout Popup (only when sidebar is collapsed) */}
                {!sidebarOpen && isHovered && item.subItems && (
                  <div 
                    className="ca-nav__flyout"
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="ca-nav__flyout-header">
                      <Icon size={16} strokeWidth={2} />
                      <span>{item.label}</span>
                    </div>
                    <div className="ca-nav__flyout-content">
                      {item.subItems.map((subItem: any) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`ca-nav__flyout-item ${pathActive(pathname, subItem.href) ? "ca-nav__flyout-item--active" : ""}`}
                          onClick={closeOnNavigate}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="ca-nav__bottom">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = pathActive(pathname, item.href);
            const Icon = getIcon(item.icon);

            return (
              <div key={item.href} className="ca-nav__item-wrapper">
                <Link
                  href={item.href}
                  className={`ca-nav__link ca-nav__link--bottom ${active ? "ca-nav__link--active" : ""} ${item.href === "/logout" ? "ca-nav__link--logout" : ""}`}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </div>

        {/* User Profile */}
        <button
          className="ca-sidebar__user"
          onClick={() => router.push("/settings")}
          onMouseEnter={() => setHoveredItem("user")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="ca-sidebar__avatar">
            {initials}
          </div>
          {sidebarOpen && (
            <div className="ca-sidebar__user-text">
              <div className="ca-sidebar__user-name">{name}</div>
              <div className="ca-sidebar__user-email">{email}</div>
            </div>
          )}

          {/* User Flyout (collapsed mode) */}
          {!sidebarOpen && hoveredItem === "user" && (
            <div 
              className="ca-nav__flyout"
              onMouseEnter={() => setHoveredItem("user")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="ca-nav__flyout-header">
                <div className="ca-sidebar__avatar">{initials}</div>
                <span>{name}</span>
              </div>
              <div className="ca-nav__flyout-content">
                <div className="ca-sidebar__user-email">{email}</div>
                <Link
                  href="/settings"
                  className="ca-nav__flyout-item"
                  onClick={() => router.push("/settings")}
                >
                  <Settings size={14} />
                  Settings
                </Link>
              </div>
            </div>
          )}
        </button>
      </aside>
    </>
  );
}
