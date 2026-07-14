import { listPosts, listTags, postUrl } from "@/lib/posts";
import type { MetadataRoute } from "next";

const BASE = "https://portfolio.hstart.in";

const staticRoutes: Array<{ path: string; changeFrequency: "weekly" | "monthly" }> = [
  { path: "/", changeFrequency: "weekly" },
  { path: "/writing", changeFrequency: "weekly" },
  { path: "/work", changeFrequency: "monthly" },
  { path: "/projects", changeFrequency: "weekly" },
  { path: "/now", changeFrequency: "weekly" },
  { path: "/uses", changeFrequency: "monthly" },
  { path: "/resume", changeFrequency: "monthly" },
  { path: "/whoami", changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([listPosts(), listTags()]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority: path === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p) => !p.frontmatter.draft)
    .map((post) => ({
      url: `${BASE}${postUrl(post.slug)}`,
      lastModified: new Date(post.frontmatter.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const tagEntries: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${BASE}/writing/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
