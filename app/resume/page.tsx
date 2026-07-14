import { formatMonth, loadExperience, loadIdentity } from "@/lib/content";
import type { Milestone } from "@/lib/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "resume",
  description: "Printable single-page résumé.",
};

function companySpan(milestones: Milestone[]): { start: string; end: string } {
  const starts = milestones.map((m) => m.start).sort();
  const hasPresent = milestones.some((m) => m.end === "present");
  const ends = milestones
    .map((m) => m.end)
    .filter((e) => e !== "present")
    .sort();
  return {
    start: starts[0] ?? "",
    end: hasPresent ? "present" : (ends[ends.length - 1] ?? ""),
  };
}

export default async function ResumePage() {
  const [identity, entries] = await Promise.all([loadIdentity(), loadExperience()]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-[13px] leading-snug">
      <p className="font-mono text-xs text-[color:var(--color-muted)] no-print">
        $ cat resume · <kbd className="font-mono">⌘P</kbd> to print
      </p>
      <header className="mt-4 border-b border-[color:var(--color-border)] pb-4">
        <h1 className="font-mono text-2xl font-medium tracking-tight">{identity.name}</h1>
        <p className="mt-1 font-mono text-xs text-[color:var(--color-muted)]">
          {identity.headline} · {identity.location}
        </p>
        <p className="mt-2 font-mono text-xs">
          <a href={`mailto:${identity.email}`} className="mr-3">
            {identity.email}
          </a>
          <a href={`https://github.com/${identity.socials.github}`} className="mr-3">
            github.com/{identity.socials.github}
          </a>
          <a href={`https://www.linkedin.com/in/${identity.socials.linkedin}`}>
            linkedin.com/in/{identity.socials.linkedin}
          </a>
        </p>
      </header>

      <section className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
          Experience
        </h2>
        <ol className="mt-3 space-y-6">
          {entries.map((entry) => {
            const span = companySpan(entry.milestones);
            return (
              <li key={`${entry.company}-${span.start}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-mono text-sm font-medium">{entry.company}</p>
                  <p className="font-mono text-xs text-[color:var(--color-muted)]">
                    {formatMonth(span.start)} → {formatMonth(span.end)} · {entry.location}
                  </p>
                </div>
                <ol className="mt-2 space-y-3 border-l border-[color:var(--color-border)] pl-3">
                  {entry.milestones.map((m) => (
                    <li key={`${m.role}-${m.start}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-mono text-[13px]">{m.role}</p>
                        <p className="font-mono text-[11px] text-[color:var(--color-muted)]">
                          {formatMonth(m.start)} → {formatMonth(m.end)}
                        </p>
                      </div>
                      <ul className="mt-1 space-y-1">
                        {m.highlights.map((h) => (
                          <li key={h} className="flex gap-2 text-[13px]">
                            <span aria-hidden className="text-[color:var(--color-accent)]">
                              ❯
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
                {entry.stack.length > 0 && (
                  <p className="mt-2 font-mono text-xs text-[color:var(--color-muted)]">
                    {entry.stack.join(" · ")}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
          Interests
        </h2>
        <p className="mt-2 text-[13px]">
          {identity.passions.join(" · ")}. Currently training{" "}
          {identity.currently.training.join(" and ")}
          {identity.currently.planning.length > 0 &&
            `; planning ${identity.currently.planning.join(", ")}`}
          .
        </p>
      </section>
    </main>
  );
}
