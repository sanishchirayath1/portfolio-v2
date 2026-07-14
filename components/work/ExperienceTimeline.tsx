"use client";

import { formatMonth } from "@/lib/format";
import type { ExperienceEntry, Milestone } from "@/lib/schema";
import { useEffect, useRef } from "react";

interface Props {
  entries: ExperienceEntry[];
}

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

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

export function ExperienceTimeline({ entries }: Props) {
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const focusedIndex = useRef<number>(-1);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      if (e.key !== "j" && e.key !== "k") return;
      e.preventDefault();
      const dir = e.key === "j" ? 1 : -1;
      const current = focusedIndex.current;
      const next = current === -1 ? (dir === 1 ? 0 : entries.length - 1) : current + dir;
      const clamped = Math.max(0, Math.min(entries.length - 1, next));
      focusedIndex.current = clamped;
      itemRefs.current[clamped]?.focus();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [entries.length]);

  return (
    <ol className="relative border-l border-[color:var(--color-border)] pl-6">
      {entries.map((entry, idx) => {
        const span = companySpan(entry.milestones);
        const currentRole = entry.milestones[0]?.role ?? "";
        return (
          <li key={`${entry.company}-${span.start}`} className="mb-10 last:mb-0">
            <article
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              tabIndex={0}
              aria-label={`${entry.company}, ${currentRole}, ${formatMonth(span.start)} to ${formatMonth(span.end)}`}
              className="relative -ml-[1.375rem] rounded pl-6 outline-none focus-visible:bg-[color:color-mix(in_oklab,var(--color-accent)_10%,transparent)]"
            >
              <span
                aria-hidden
                className="absolute left-[1rem] top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[color:var(--color-accent)]"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-mono text-base font-medium">{entry.company}</h3>
                <p className="font-mono text-xs text-[color:var(--color-muted)]">
                  {formatMonth(span.start)} → {formatMonth(span.end)}
                </p>
              </div>
              <p className="mt-1 font-mono text-xs text-[color:var(--color-muted)]">
                {entry.location}
              </p>

              <ol className="mt-4 space-y-5 border-l border-[color:var(--color-border)]/60 pl-4">
                {entry.milestones.map((m) => (
                  <li key={`${m.role}-${m.start}`} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[1.15rem] top-[0.55rem] h-1.5 w-1.5 rounded-full bg-[color:var(--color-muted)]"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-mono text-sm">{m.role}</p>
                      <p className="font-mono text-xs text-[color:var(--color-muted)]">
                        {formatMonth(m.start)} → {formatMonth(m.end)}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                      {m.highlights.map((h) => (
                        <li key={h} className="flex gap-2">
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
                <p className="mt-4 font-mono text-xs text-[color:var(--color-muted)]">
                  {entry.stack.join(" · ")}
                </p>
              )}
              {entry.links.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs">
                  {entry.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
