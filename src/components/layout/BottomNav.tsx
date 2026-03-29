"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV } from "@/lib/constants";

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="ca-bottom-nav" aria-label="Mobile">
      {BOTTOM_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={active(pathname, item.href) ? "true" : "false"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
