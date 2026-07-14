"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 font-mono">
      <p className="text-xs text-[color:var(--color-muted)]">$ ./portfolio</p>
      <pre className="mt-4 text-sm text-[color:var(--color-fg)]">
        <span className="text-[color:var(--color-accent)]">error</span>: something threw during
        render
      </pre>
      <h1 className="mt-6 text-2xl font-medium tracking-tight lowercase">500 · unhandled</h1>
      <p className="mt-3 text-sm text-[color:var(--color-muted)]">
        A component failed to render. This isn't supposed to happen; the failure has been logged to
        the console.
      </p>

      {error.digest && (
        <p className="mt-4 text-xs text-[color:var(--color-muted)]">digest · {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          onClick={reset}
          className="border border-[color:var(--color-border)] px-3 py-1 hover:text-[color:var(--color-accent)]"
        >
          <span className="mr-2 text-[color:var(--color-accent)]">❯</span>retry
        </button>
        <a
          href="/"
          className="border border-[color:var(--color-border)] px-3 py-1 hover:text-[color:var(--color-accent)]"
        >
          <span className="mr-2 text-[color:var(--color-accent)]">❯</span>go home
        </a>
      </div>
    </main>
  );
}
