import { CommitSparkline } from "@/components/sparkline/CommitSparkline";
import { loadIdentity } from "@/lib/content";
import { getContributionSparkline } from "@/lib/contributions";
import { formatPostDate, listPosts, postUrl } from "@/lib/posts";
import { getCachedProjects } from "@/lib/projects-cache";
import Link from "next/link";

export default async function HomePage() {
  const [identity, posts, projectsResult, contributions] = await Promise.all([
    loadIdentity(),
    listPosts(),
    getCachedProjects(),
    getContributionSparkline(),
  ]);
  const latestPosts = posts.filter((p) => !p.frontmatter.draft).slice(0, 3);
  const pinnedProjects = projectsResult.projects.slice(0, 4);
  const trainingSummary = identity.currently.training.join(" + ");
  const planningSummary = identity.currently.planning.join(", ");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ whoami</p>
        <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight lowercase">
          {identity.name}
        </h1>
        <p className="mt-1 font-mono text-sm text-[color:var(--color-muted)]">
          {identity.headline.toLowerCase()} · {identity.location.toLowerCase()}
        </p>
      </header>

      <section className="mt-10">
        <p className="text-base leading-relaxed">
          Currently at{" "}
          <a
            href="https://www.usebruno.com"
            className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-accent)]"
          >
            Bruno
          </a>{" "}
          , building an open-source API client that respects your git workflow. Interested in the
          intersection of systems, markets, and endurance.
        </p>
        <p className="mt-4 font-mono text-xs text-[color:var(--color-muted)]">
          <span className="text-[color:var(--color-accent)]">●</span> currently · training{" "}
          {trainingSummary}
          {planningSummary && ` · planning ${planningSummary}`}
        </p>
      </section>

      {contributions.weeks.length > 0 && (
        <section className="mt-10">
          <CommitSparkline
            weeks={contributions.weeks}
            total={contributions.total}
            logins={contributions.logins}
          />
        </section>
      )}

      <section className="mt-14">
        <h2 className="font-mono text-xs text-[color:var(--color-muted)]"># writing</h2>
        {latestPosts.length === 0 ? (
          <p className="mt-3 font-mono text-sm text-[color:var(--color-muted)]">
            Nothing published yet.{" "}
            <Link
              href="/writing"
              className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
            >
              all writing →
            </Link>
          </p>
        ) : (
          <>
            <ol className="mt-3 space-y-3">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={postUrl(post.slug)} className="group block">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-mono text-sm group-hover:text-[color:var(--color-accent)]">
                        {post.frontmatter.title}
                      </p>
                      <p className="font-mono text-xs text-[color:var(--color-muted)]">
                        {formatPostDate(post.frontmatter.date)} · {post.readingTimeMinutes} min
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-mono text-xs">
              <Link
                href="/writing"
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
              >
                all writing →
              </Link>
            </p>
          </>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs text-[color:var(--color-muted)]"># projects</h2>
        {pinnedProjects.length === 0 ? (
          <p className="mt-3 font-mono text-sm text-[color:var(--color-muted)]">
            Pinned repos from{" "}
            <a
              href={`https://github.com/${identity.socials.github}`}
              className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
            >
              @{identity.socials.github}
            </a>{" "}
            appear here once GITHUB_TOKEN is configured.{" "}
            <Link
              href="/projects"
              className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
            >
              all projects →
            </Link>
          </p>
        ) : (
          <>
            <ol className="mt-3 space-y-3">
              {pinnedProjects.map((project) => (
                <li key={project.slug}>
                  <a href={project.url} className="group block" rel="noopener">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-mono text-sm group-hover:text-[color:var(--color-accent)]">
                        {project.name}
                      </p>
                      <p className="font-mono text-xs text-[color:var(--color-muted)]">
                        {project.primaryLanguage ?? ""}
                        {project.stars > 0 && ` · ★ ${project.stars}`}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">
                      {project.headline ?? (project.description || "No description.")}
                    </p>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-mono text-xs">
              <Link
                href="/projects"
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
              >
                all projects →
              </Link>
            </p>
          </>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs text-[color:var(--color-muted)]"># elsewhere</h2>
        <ul className="mt-3 space-y-1 font-mono text-sm">
          <li>
            <span className="text-[color:var(--color-muted)]">github://</span>{" "}
            <a
              href={`https://github.com/${identity.socials.github}`}
              className="hover:text-[color:var(--color-accent)]"
            >
              {identity.socials.github}
            </a>
          </li>
          <li>
            <span className="text-[color:var(--color-muted)]">linkedin://</span>{" "}
            <a
              href={`https://www.linkedin.com/in/${identity.socials.linkedin}`}
              className="hover:text-[color:var(--color-accent)]"
            >
              {identity.socials.linkedin}
            </a>
          </li>
          <li>
            <span className="text-[color:var(--color-muted)]">twitter://</span>{" "}
            <a
              href={`https://twitter.com/${identity.socials.twitter}`}
              className="hover:text-[color:var(--color-accent)]"
            >
              @{identity.socials.twitter}
            </a>
          </li>
          <li>
            <span className="text-[color:var(--color-muted)]">email://</span>{" "}
            <a href={`mailto:${identity.email}`} className="hover:text-[color:var(--color-accent)]">
              {identity.email}
            </a>
          </li>
        </ul>
      </section>

      <p className="mt-16 font-mono text-xs text-[color:var(--color-muted)]">
        press <kbd className="font-mono">g</kbd> <kbd className="font-mono">h</kbd> for home,{" "}
        <kbd className="font-mono">g</kbd> <kbd className="font-mono">w</kbd> for writing,{" "}
        <kbd className="font-mono">g</kbd> <kbd className="font-mono">k</kbd> for work.
      </p>
    </main>
  );
}
