import { formatPostDate, listPosts, listTags, postUrl } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "writing",
  description: "Long-form notes on systems, tools, and detours.",
};

export default async function WritingIndexPage() {
  const [posts, tags] = await Promise.all([listPosts(), listTags()]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ ls -lt writing</p>
        <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight lowercase">writing</h1>
        <p className="mt-1 font-mono text-sm text-[color:var(--color-muted)]">
          {posts.length} {posts.length === 1 ? "post" : "posts"} ·{" "}
          <a
            href="/rss.xml"
            className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
          >
            rss
          </a>{" "}
          ·{" "}
          <a
            href="/feed.json"
            className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
          >
            json feed
          </a>
        </p>
      </header>

      {tags.length > 0 && (
        <nav aria-label="Tags" className="mt-8">
          <p className="font-mono text-xs text-[color:var(--color-muted)]"># tags</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
            {tags.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/writing/tag/${tag}`}
                  className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
                >
                  {tag}
                  <span className="text-[color:var(--color-muted)]">({count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section className="mt-10">
        {posts.length === 0 ? (
          <p className="font-mono text-sm text-[color:var(--color-muted)]">
            Nothing published yet. Check back soon.
          </p>
        ) : (
          <ol className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="font-mono text-base">
                      <Link
                        href={postUrl(post.slug)}
                        className="hover:text-[color:var(--color-accent)]"
                      >
                        {post.frontmatter.draft && (
                          <span className="mr-2 text-[color:var(--color-muted)]">[draft]</span>
                        )}
                        {post.frontmatter.title}
                      </Link>
                    </h2>
                    <p className="font-mono text-xs text-[color:var(--color-muted)]">
                      {formatPostDate(post.frontmatter.date)} · {post.readingTimeMinutes} min
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">
                    {post.frontmatter.summary}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
