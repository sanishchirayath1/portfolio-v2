import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PostFrontmatterSchema } from "../lib/schema";

const CANONICAL_HOST = "https://portfolio.hstart.in";
const DEVTO_API = "https://dev.to/api/articles";
const WRITING_DIR = path.join(process.cwd(), "content", "writing");
const LOCK_PATH = path.join(process.cwd(), ".syndication-lock.json");

const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose") || DRY_RUN;

type LockEntry = {
  devto_id: number;
  devto_url: string;
  content_hash: string;
  updated_at: string;
};

type Lock = {
  posts: Record<string, LockEntry>;
};

async function readLock(): Promise<Lock> {
  try {
    const raw = await readFile(LOCK_PATH, "utf-8");
    return JSON.parse(raw) as Lock;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { posts: {} };
    }
    throw err;
  }
}

async function writeLock(lock: Lock): Promise<void> {
  const sorted: Lock = {
    posts: Object.fromEntries(Object.entries(lock.posts).sort(([a], [b]) => a.localeCompare(b))),
  };
  await writeFile(LOCK_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");
}

function stripMdx(source: string): { body: string; warnings: string[] } {
  const warnings = new Set<string>();
  let body = source;

  body = body.replace(/<([A-Z][A-Za-z0-9]*)([^>]*?)\/>/g, (_, name: string) => {
    warnings.add(`stripped self-closing <${name} />`);
    return "";
  });

  body = body.replace(
    /<([A-Z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/g,
    (_, name: string, inner: string) => {
      warnings.add(`stripped <${name}>…</${name}> (kept inner text)`);
      return inner;
    },
  );

  body = body.replace(/^import\s+.+?\bfrom\s+['"][^'"]+['"];?\s*$/gm, "");
  body = body.replace(/^export\s+.+?$/gm, "");

  body = body.replace(/\n{3,}/g, "\n\n").trim();

  return { body, warnings: [...warnings] };
}

function normalizeTags(tags: string[]): string[] {
  return tags
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 0)
    .slice(0, 4);
}

function hashContent(input: {
  title: string;
  summary: string;
  body_markdown: string;
  canonical_url: string;
  tags: string[];
}): string {
  const canonical = JSON.stringify({
    title: input.title,
    summary: input.summary,
    body_markdown: input.body_markdown,
    canonical_url: input.canonical_url,
    tags: input.tags,
  });
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

type Article = {
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  canonical_url: string;
  tags: string[];
  warnings: string[];
};

async function loadArticles(): Promise<Article[]> {
  const files = await readdir(WRITING_DIR);
  const articles: Article[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const raw = await readFile(path.join(WRITING_DIR, file), "utf-8");
    const { content, data } = matter(raw);
    const fm = PostFrontmatterSchema.parse(data);
    if (fm.draft) {
      if (VERBOSE) console.log(`skip ${slug}: draft`);
      continue;
    }
    if (!fm.syndicate) {
      if (VERBOSE) console.log(`skip ${slug}: syndicate:false`);
      continue;
    }
    const { body, warnings } = stripMdx(content);
    articles.push({
      slug,
      title: fm.title,
      summary: fm.summary,
      body_markdown: body,
      canonical_url: `${CANONICAL_HOST}/writing/${slug}`,
      tags: normalizeTags(fm.tags),
      warnings,
    });
  }
  return articles;
}

type DevtoResponse = {
  id: number;
  url: string;
};

async function createOnDevto(article: Article, apiKey: string): Promise<DevtoResponse> {
  const res = await fetch(DEVTO_API, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-syndicate",
    },
    body: JSON.stringify({
      article: {
        title: article.title,
        body_markdown: article.body_markdown,
        published: true,
        canonical_url: article.canonical_url,
        description: article.summary,
        tags: article.tags,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`create failed for ${article.slug}: ${res.status} ${text}`);
  }
  return (await res.json()) as DevtoResponse;
}

async function updateOnDevto(id: number, article: Article, apiKey: string): Promise<DevtoResponse> {
  const res = await fetch(`${DEVTO_API}/${id}`, {
    method: "PUT",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-syndicate",
    },
    body: JSON.stringify({
      article: {
        title: article.title,
        body_markdown: article.body_markdown,
        published: true,
        canonical_url: article.canonical_url,
        description: article.summary,
        tags: article.tags,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`update failed for ${article.slug} (id=${id}): ${res.status} ${text}`);
  }
  return (await res.json()) as DevtoResponse;
}

type Outcome =
  | { slug: string; action: "created" | "updated"; devto_url: string }
  | { slug: string; action: "unchanged" }
  | { slug: string; action: "error"; error: string };

async function main(): Promise<void> {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey && !DRY_RUN) {
    console.error("DEVTO_API_KEY not set. Use --dry-run to preview without publishing.");
    process.exit(1);
  }

  const [articles, lock] = await Promise.all([loadArticles(), readLock()]);
  const outcomes: Outcome[] = [];

  for (const article of articles) {
    const hash = hashContent(article);
    const existing = lock.posts[article.slug];

    if (article.warnings.length > 0) {
      for (const w of article.warnings) {
        console.warn(`warn ${article.slug}: ${w}`);
      }
    }

    if (existing && existing.content_hash === hash) {
      outcomes.push({ slug: article.slug, action: "unchanged" });
      continue;
    }

    if (DRY_RUN) {
      const kind = existing ? "would update" : "would create";
      console.log(`${kind} ${article.slug} (${article.body_markdown.length} chars)`);
      outcomes.push({
        slug: article.slug,
        action: existing ? "updated" : "created",
        devto_url: existing?.devto_url ?? "(dry-run)",
      });
      continue;
    }

    try {
      const result = existing
        ? await updateOnDevto(existing.devto_id, article, apiKey ?? "")
        : await createOnDevto(article, apiKey ?? "");
      lock.posts[article.slug] = {
        devto_id: result.id,
        devto_url: result.url,
        content_hash: hash,
        updated_at: new Date().toISOString(),
      };
      outcomes.push({
        slug: article.slug,
        action: existing ? "updated" : "created",
        devto_url: result.url,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`error ${article.slug}: ${msg}`);
      outcomes.push({ slug: article.slug, action: "error", error: msg });
    }
  }

  const activeSlugs = new Set(articles.map((a) => a.slug));
  for (const slug of Object.keys(lock.posts)) {
    if (!activeSlugs.has(slug)) {
      console.warn(`warn ${slug}: in lock but not in content/writing (kept, remove manually)`);
    }
  }

  if (!DRY_RUN) {
    await writeLock(lock);
  }

  const counts = outcomes.reduce<Record<string, number>>((acc, o) => {
    acc[o.action] = (acc[o.action] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(counts)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  console.log(`syndicate: ${summary || "no posts"}${DRY_RUN ? " (dry-run)" : ""}`);

  const errors = outcomes.filter((o) => o.action === "error").length;
  if (errors > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
