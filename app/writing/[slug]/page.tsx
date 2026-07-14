import { Prose } from "@/components/typography/Prose";
import { mdxOptions } from "@/lib/mdx-options";
import { formatPostDate, getPost, listPosts, postUrl } from "@/lib/posts";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};
  const { title, summary } = post.frontmatter;
  const ogUrl = `/og?title=${encodeURIComponent(title)}`;
  return {
    title,
    description: summary,
    openGraph: {
      title,
      description: summary,
      type: "article",
      url: postUrl(slug),
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [ogUrl],
    },
    alternates: {
      canonical: postUrl(slug),
    },
  };
}

export default async function PostPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  const posts = await listPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  const prev = idx >= 0 ? posts[idx + 1] : null;
  const next = idx > 0 ? posts[idx - 1] : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs text-[color:var(--color-muted)]">$ cat writing/{slug}.mdx</p>

      <header className="mt-6 border-b border-[color:var(--color-border)] pb-6">
        <h1 className="font-mono text-2xl font-medium tracking-tight leading-tight">
          {post.frontmatter.title}
        </h1>
        <p className="mt-3 font-mono text-xs text-[color:var(--color-muted)]">
          {formatPostDate(post.frontmatter.date)} · {post.readingTimeMinutes} min
          {post.frontmatter.tags.length > 0 && (
            <>
              {" · "}
              {post.frontmatter.tags.map((t, i) => (
                <span key={t}>
                  {i > 0 && " "}
                  <Link href={`/writing/tag/${t}`} className="hover:text-[color:var(--color-fg)]">
                    #{t}
                  </Link>
                </span>
              ))}
            </>
          )}
        </p>
      </header>

      <article className="mt-8">
        <Prose>
          <MDXRemote source={post.content} options={{ mdxOptions }} />
        </Prose>
      </article>

      <nav
        aria-label="Post navigation"
        className="mt-16 grid gap-6 border-t border-[color:var(--color-border)] pt-6 sm:grid-cols-2"
      >
        <div>
          {prev && (
            <Link href={postUrl(prev.slug)} className="group block">
              <p className="font-mono text-xs text-[color:var(--color-muted)]">← previous</p>
              <p className="mt-1 font-mono text-sm group-hover:text-[color:var(--color-accent)]">
                {prev.frontmatter.title}
              </p>
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {next && (
            <Link href={postUrl(next.slug)} className="group block">
              <p className="font-mono text-xs text-[color:var(--color-muted)]">next →</p>
              <p className="mt-1 font-mono text-sm group-hover:text-[color:var(--color-accent)]">
                {next.frontmatter.title}
              </p>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
