import { formatPostDate, listPostsByTag, listTags, postUrl } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Params {
  tag: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const tags = await listTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag } = await props.params;
  return {
    title: `#${tag}`,
    description: `Posts tagged #${tag}.`,
  };
}

export default async function TagPage(props: { params: Promise<Params> }) {
  const { tag } = await props.params;
  const posts = await listPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header>
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ grep -l '{tag}' *.mdx</p>
        <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight lowercase">#{tag}</h1>
        <p className="mt-1 font-mono text-sm text-[color:var(--color-muted)]">
          {posts.length} {posts.length === 1 ? "post" : "posts"} ·{" "}
          <Link
            href="/writing"
            className="underline decoration-[color:var(--color-accent)] underline-offset-4 hover:text-[color:var(--color-fg)]"
          >
            all writing
          </Link>
        </p>
      </header>

      <ol className="mt-10 space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="font-mono text-base">
                  <Link
                    href={postUrl(post.slug)}
                    className="hover:text-[color:var(--color-accent)]"
                  >
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
    </main>
  );
}
