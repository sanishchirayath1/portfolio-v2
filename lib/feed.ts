import "server-only";

import { loadIdentity } from "./content";
import { listPosts, postUrl } from "./posts";

const SITE_URL = "https://portfolio.hstart.in";

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function buildRssXml(): Promise<string> {
  const [identity, posts] = await Promise.all([loadIdentity(), listPosts()]);
  const published = posts.filter((p) => !p.frontmatter.draft);
  const lastBuild = published[0]?.frontmatter.date ?? new Date().toISOString();

  const items = published
    .map((post) => {
      const url = `${SITE_URL}${postUrl(post.slug)}`;
      const pubDate = new Date(post.frontmatter.date).toUTCString();
      const categories = post.frontmatter.tags
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.frontmatter.summary)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(identity.name)}</title>
    <link>${SITE_URL}</link>
    <description>Writing by ${escapeXml(identity.name)} — ${escapeXml(identity.headline)}.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

export async function buildJsonFeed(): Promise<string> {
  const [identity, posts] = await Promise.all([loadIdentity(), listPosts()]);
  const published = posts.filter((p) => !p.frontmatter.draft);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: identity.name,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: `Writing by ${identity.name}.`,
    language: "en-us",
    authors: [
      {
        name: identity.name,
        url: SITE_URL,
      },
    ],
    items: published.map((post) => ({
      id: `${SITE_URL}${postUrl(post.slug)}`,
      url: `${SITE_URL}${postUrl(post.slug)}`,
      title: post.frontmatter.title,
      summary: post.frontmatter.summary,
      content_text: post.frontmatter.summary,
      date_published: new Date(post.frontmatter.date).toISOString(),
      tags: post.frontmatter.tags,
    })),
  };

  return JSON.stringify(feed, null, 2);
}
