"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  open: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ open, onNavigate }: Props) {
  const pathname = usePathname();

  return (
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
                active ? "ca-nav__link ca-nav__link--active" : "ca-nav__link"
              }
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
