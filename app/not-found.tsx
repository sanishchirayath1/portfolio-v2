import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "not found",
  robots: { index: false, follow: false },
};

const SUGGESTIONS: Array<{ path: string; label: string }> = [
  { path: "/", label: "home" },
  { path: "/writing", label: "writing" },
  { path: "/projects", label: "projects" },
  { path: "/whoami", label: "whoami" },
];

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 font-mono">
      <p className="text-xs text-[color:var(--color-muted)]">$ cat $_</p>
      <pre className="mt-4 text-sm text-[color:var(--color-fg)]">
        <span className="text-[color:var(--color-accent)]">cat</span>: not a typewriter
      </pre>
      <h1 className="mt-6 text-2xl font-medium tracking-tight lowercase">404 · path not found</h1>
      <p className="mt-3 text-sm text-[color:var(--color-muted)]">
        The URL you typed doesn't map to anything I've written. Nothing was moved; it probably never
        existed. If you followed a link from elsewhere, let me know.
      </p>

      <div className="mt-10">
        <p className="text-xs text-[color:var(--color-muted)]"># try one of these</p>
        <ul className="mt-3 space-y-1 text-sm">
          {SUGGESTIONS.map((s) => (
            <li key={s.path}>
              <Link href={s.path} className="hover:text-[color:var(--color-accent)]">
                <span className="mr-2 text-[color:var(--color-accent)]">❯</span>
                {s.label}
                <span className="ml-2 text-[color:var(--color-muted)]">{s.path}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-10 text-xs text-[color:var(--color-muted)]">
        press <kbd className="font-mono">⌘K</kbd> to search
      </p>
    </main>
  );
}
