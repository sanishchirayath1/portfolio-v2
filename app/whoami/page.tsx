import { WhoamiRepl } from "@/components/whoami/WhoamiRepl";
import { loadIdentity } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "whoami",
  description: "Unix man-page style intro.",
};

export default async function WhoamiPage() {
  const identity = await loadIdentity();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        <span className="text-[color:var(--color-muted)]">
          SANISH(1){"                       "}Portfolio Manual{"                       "}SANISH(1)
        </span>
        {"\n\n"}
        <strong className="text-[color:var(--color-fg)]">NAME</strong>
        {"\n"}
        {"       "}sanish - software engineer, market watcher, endurance athlete
        {"\n\n"}
        <strong className="text-[color:var(--color-fg)]">SYNOPSIS</strong>
        {"\n"}
        {"       "}
        <span className="text-[color:var(--color-accent)]">sanish</span> [--writing] [--work]
        [--projects] [--now] [--uses]
        {"\n\n"}
        <strong className="text-[color:var(--color-fg)]">DESCRIPTION</strong>
        {"\n"}
        {"       "}
        {identity.headline} based in {identity.location}. Currently {identity.currently.role}.
        Interests: {identity.passions.join(", ")}.{"\n\n"}
        <strong className="text-[color:var(--color-fg)]">OPTIONS</strong>
        {"\n"}
        {"       "}--writing{"\n"}
        {"              "}Long-form notes on systems, tools, and the occasional detour.
        {"\n\n"}
        {"       "}--work{"\n"}
        {"              "}Roles, dates, highlights worth remembering.
        {"\n\n"}
        {"       "}--projects{"\n"}
        {"              "}Live from{" "}
        <a
          href={`https://github.com/${identity.socials.github}`}
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          @{identity.socials.github}
        </a>
        . Auto-synced.
        {"\n\n"}
        {"       "}--now{"\n"}
        {"              "}This week: training {identity.currently.training.join(" + ")}.{"\n\n"}
        {"       "}--uses{"\n"}
        {"              "}Editor, terminal, hardware.
        {"\n\n"}
        <strong className="text-[color:var(--color-fg)]">EXAMPLES</strong>
        {"\n"}
        {"       "}$ curl portfolio.hstart.in{"\n"}
        {"              "}Returns this document as plaintext.
        {"\n\n"}
        {"       "}$ g h{"\n"}
        {"              "}Jump home from anywhere on the site.
        {"\n\n"}
        <strong className="text-[color:var(--color-fg)]">SEE ALSO</strong>
        {"\n"}
        {"       "}
        <a
          href="/writing"
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          writing(1)
        </a>
        ,{" "}
        <a
          href="/work"
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          work(1)
        </a>
        ,{" "}
        <a
          href="/projects"
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          projects(1)
        </a>
        ,{" "}
        <a
          href="/now"
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          now(1)
        </a>
        ,{" "}
        <a
          href="/uses"
          className="underline decoration-[color:var(--color-accent)] underline-offset-4"
        >
          uses(1)
        </a>
        {"\n\n"}
        <span className="text-[color:var(--color-muted)]">
          Bangalore{"                              "}v2{"                              "}SANISH(1)
        </span>
      </pre>
      <WhoamiRepl
        name={identity.name}
        role={identity.currently.role}
        location={identity.location}
      />
    </main>
  );
}
