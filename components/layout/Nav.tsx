"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home", key: "h" },
  { href: "/writing", label: "writing", key: "w" },
  { href: "/work", label: "work", key: "k" },
  { href: "/projects", label: "projects", key: "p" },
  { href: "/now", label: "now", key: "n" },
  { href: "/uses", label: "uses", key: "u" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="border-b border-[color:var(--color-border)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
        >
          sanish
          <span className="text-[color:var(--color-accent)]">.</span>
        </Link>
        <ul className="flex items-center gap-4 font-mono text-xs">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "text-[color:var(--color-fg)] underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4"
                      : "text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
