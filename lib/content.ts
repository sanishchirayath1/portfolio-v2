import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { type ExperienceEntry, ExperienceSchema, type Identity, IdentitySchema } from "./schema";

export { formatMonth } from "./format";

const contentDir = path.join(process.cwd(), "content");

const cache = new Map<string, unknown>();

async function loadYaml<T>(relativePath: string, parse: (raw: unknown) => T): Promise<T> {
  const cacheKey = `yaml:${relativePath}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit as T;
  const filePath = path.join(contentDir, relativePath);
  const raw = await readFile(filePath, "utf-8");
  const parsed = parse(parseYaml(raw));
  cache.set(cacheKey, parsed);
  return parsed;
}

export async function loadIdentity(): Promise<Identity> {
  return loadYaml("identity.yaml", (raw) => IdentitySchema.parse(raw));
}

export async function loadExperience(): Promise<ExperienceEntry[]> {
  return loadYaml("experience.yaml", (raw) => ExperienceSchema.parse(raw));
}

export interface MdxDoc {
  content: string;
  data: Record<string, unknown>;
}

export async function loadMdx(relativePath: string): Promise<MdxDoc> {
  const cacheKey = `mdx:${relativePath}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit as MdxDoc;
  const filePath = path.join(contentDir, relativePath);
  const raw = await readFile(filePath, "utf-8");
  const { content, data } = matter(raw);
  const doc = { content, data };
  cache.set(cacheKey, doc);
  return doc;
}
