import { ProjectCard } from "@/components/projects/ProjectCard";
import { loadIdentity } from "@/lib/content";
import { getCachedProjects } from "@/lib/projects-cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "projects",
  description: "Live projects from GitHub, auto-synced without redeploy.",
};

export const revalidate = 600;

export default async function ProjectsPage() {
  const [identity, { projects, source, error }] = await Promise.all([
    loadIdentity(),
    getCachedProjects(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">
          $ gh repo list {identity.socials.github} --topic portfolio
        </p>
        <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight lowercase">projects</h1>
        <p className="mt-1 font-mono text-sm text-[color:var(--color-muted)]">
          live from{" "}
          <a
            href={`https://github.com/${identity.socials.github}`}
            className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
          >
            @{identity.socials.github}
          </a>{" "}
          · {projects.length} {projects.length === 1 ? "repo" : "repos"} ·{" "}
          <span
            title={
              source === "github"
                ? "Fetched from GitHub API"
                : source === "snapshot"
                  ? "Serving last-known-good snapshot"
                  : "No data available"
            }
          >
            source: <span className="text-[color:var(--color-accent)]">{source}</span>
          </span>
        </p>
      </header>

      {source === "empty" && (
        <div className="mt-8 rounded border border-[color:var(--color-border)] p-4 font-mono text-xs text-[color:var(--color-muted)]">
          <p>
            No projects yet. Tag a public repo on{" "}
            <a
              href={`https://github.com/${identity.socials.github}`}
              className="underline hover:text-[color:var(--color-fg)]"
            >
              @{identity.socials.github}
            </a>{" "}
            with topic <span className="text-[color:var(--color-fg)]">portfolio</span> or pin it,
            and it'll appear here on next revalidation.
          </p>
          {error && (
            <p className="mt-2 text-[color:var(--color-muted)]">
              <span>{"// "}</span>
              {error}
            </p>
          )}
        </div>
      )}

      {projects.length > 0 && (
        <ol className="mt-10 space-y-6">
          {projects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
