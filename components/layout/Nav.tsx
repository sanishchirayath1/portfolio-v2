import Link from "next/link";

const links = [
  { href: "/", label: "home", key: "h" },
  { href: "/writing", label: "writing", key: "w" },
  { href: "/work", label: "work", key: "k" },
  { href: "/projects", label: "projects", key: "p" },
  { href: "/now", label: "now", key: "n" },
  { href: "/uses", label: "uses", key: "u" },
] as const;

export function Nav() {
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
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
