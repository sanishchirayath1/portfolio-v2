import { formatRelativeTime } from "@/lib/projects";
import type { Project } from "@/lib/schema";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="font-mono text-base">
          <a href={project.url} className="hover:text-[color:var(--color-accent)]" rel="noopener">
            {project.name}
          </a>
          {project.pinned && (
            <span className="ml-2 font-mono text-xs text-[color:var(--color-muted)]">[pinned]</span>
          )}
        </h3>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">
          {project.stars > 0 && <>★ {project.stars} · </>}
          pushed {formatRelativeTime(project.pushedAt)}
        </p>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">
        {project.headline ?? (project.description || "No description.")}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-[color:var(--color-muted)]">
        {project.primaryLanguage && <span>{project.primaryLanguage}</span>}
        {project.topics.length > 0 && (
          <span>
            {project.topics
              .slice(0, 4)
              .map((t) => `#${t}`)
              .join(" ")}
          </span>
        )}
        {project.homepage && (
          <a href={project.homepage} className="hover:text-[color:var(--color-fg)]">
            homepage ↗
          </a>
        )}
        {project.writeup && (
          <Link href={project.writeup} className="hover:text-[color:var(--color-fg)]">
            writeup →
          </Link>
        )}
      </p>
    </article>
  );
}
