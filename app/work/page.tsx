import { ExperienceTimeline } from "@/components/work/ExperienceTimeline";
import { loadExperience } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "work",
  description: "Roles, timeline, and the details worth remembering.",
};

export default async function WorkPage() {
  const entries = await loadExperience();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ cat work</p>
        <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight lowercase">work</h1>
        <p className="mt-1 font-mono text-sm text-[color:var(--color-muted)]">
          {entries.length} roles · press <kbd className="font-mono">j</kbd>/
          <kbd className="font-mono">k</kbd> to step
        </p>
      </header>
      <div className="mt-10">
        <ExperienceTimeline entries={entries} />
      </div>
    </main>
  );
}
