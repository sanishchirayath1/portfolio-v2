import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { Identity } from "@/lib/schema";

export function Footer({ identity }: { identity: Identity }) {
  const { socials, email } = identity;
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)]">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-6 py-6 font-mono text-xs text-[color:var(--color-muted)]">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <a href={`mailto:${email}`} className="hover:text-[color:var(--color-fg)]">
              email
            </a>
          </li>
          <li>
            <a
              href={`https://github.com/${socials.github}`}
              className="hover:text-[color:var(--color-fg)]"
              rel="me"
            >
              github
            </a>
          </li>
          <li>
            <a
              href={`https://www.linkedin.com/in/${socials.linkedin}`}
              className="hover:text-[color:var(--color-fg)]"
              rel="me"
            >
              linkedin
            </a>
          </li>
          <li>
            <a
              href={`https://twitter.com/${socials.twitter}`}
              className="hover:text-[color:var(--color-fg)]"
              rel="me"
            >
              twitter
            </a>
          </li>
          <li>
            <a href="/rss.xml" className="hover:text-[color:var(--color-fg)]">
              rss
            </a>
          </li>
        </ul>
        <ThemeToggle />
      </div>
    </footer>
  );
}
