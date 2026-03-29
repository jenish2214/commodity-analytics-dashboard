"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

export function Sidebar({ open, onToggle, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className="ca-sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
        aria-expanded={open}
      >
        {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </button>

      <aside
        className="ca-sidebar"
        data-open={open ? "true" : "false"}
        aria-label="Sidebar navigation"
      >
        <div className="ca-sidebar__logo">Commodity Analytics</div>

        <nav className="ca-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "ca-nav__link ca-nav__link--active"
                    : "ca-nav__link"
                }
                onClick={() => onNavigate?.()}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
