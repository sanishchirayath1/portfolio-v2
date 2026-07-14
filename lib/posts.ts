import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type PostFrontmatter, PostFrontmatterSchema } from "./schema";

const writingDir = path.join(process.cwd(), "content", "writing");

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  readingTimeMinutes: number;
}

let cache: Post[] | null = null;

async function loadAll(): Promise<Post[]> {
  if (cache) return cache;
  const files = await readdir(writingDir);
  const posts: Post[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const raw = await readFile(path.join(writingDir, file), "utf-8");
    const { content, data } = matter(raw);
    const frontmatter = PostFrontmatterSchema.parse(data);
    const stats = readingTime(content);
    posts.push({
      slug,
      frontmatter,
      content,
      readingTimeMinutes: Math.max(1, Math.round(stats.minutes)),
    });
  }
  posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
  cache = posts;
  return posts;
}

const includeDrafts = process.env.NODE_ENV !== "production";

export async function listPosts(): Promise<Post[]> {
  const all = await loadAll();
  return includeDrafts ? all : all.filter((p) => !p.frontmatter.draft);
}

export async function getPost(slug: string): Promise<Post | null> {
  const all = await listPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listTags(): Promise<Array<{ tag: string; count: number }>> {
  const posts = await listPosts();
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.frontmatter.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function listPostsByTag(tag: string): Promise<Post[]> {
  const posts = await listPosts();
  return posts.filter((p) => p.frontmatter.tags.includes(tag));
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function postUrl(slug: string): string {
  return `/writing/${slug}`;
}
