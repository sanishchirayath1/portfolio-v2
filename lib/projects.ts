import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fetchProjectsFromGitHub } from "./github";
import { type Project, ProjectOverrideSchema, ProjectSnapshotSchema } from "./schema";

const overridesDir = path.join(process.cwd(), "content", "projects");
const snapshotPath = path.join(process.cwd(), "content", "projects.snapshot.json");

async function loadOverrides(): Promise<Map<string, Partial<Project>>> {
  const overrides = new Map<string, Partial<Project>>();
  let files: string[] = [];
  try {
    files = await readdir(overridesDir);
  } catch {
    return overrides;
  }
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const slug = file.replace(/\.md$/, "").toLowerCase();
    const raw = await readFile(path.join(overridesDir, file), "utf-8");
    const { data } = matter(raw);
    const parsed = ProjectOverrideSchema.safeParse(data);
    if (!parsed.success) continue;
    overrides.set(slug, parsed.data);
  }
  return overrides;
}

function applyOverride(project: Project, override: Partial<Project>): Project {
  return {
    ...project,
    ...(override.headline !== undefined && { headline: override.headline }),
    ...(override.featured !== undefined && { featured: override.featured }),
    ...(override.hidden !== undefined && { hidden: override.hidden }),
    ...(override.writeup !== undefined && { writeup: override.writeup }),
  };
}

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.pushedAt < b.pushedAt ? 1 : -1;
  });
}

async function loadSnapshot(): Promise<Project[]> {
  try {
    const raw = await readFile(snapshotPath, "utf-8");
    const parsed = ProjectSnapshotSchema.parse(JSON.parse(raw));
    return parsed.projects;
  } catch {
    return [];
  }
}

export interface ProjectsResult {
  projects: Project[];
  source: "github" | "snapshot" | "empty";
  error: string | null;
}

export async function loadProjects(): Promise<ProjectsResult> {
  const overrides = await loadOverrides();
  let fromApi: Project[] | null = null;
  let error: string | null = null;

  try {
    fromApi = await fetchProjectsFromGitHub();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown GitHub API error";
  }

  const raw = fromApi ?? (await loadSnapshot());
  const merged = raw.map((p) => {
    const override = overrides.get(p.slug);
    return override ? applyOverride(p, override) : p;
  });
  const visible = merged.filter((p) => !p.hidden);
  const projects = sortProjects(visible);

  let source: ProjectsResult["source"];
  if (fromApi) source = "github";
  else if (projects.length > 0) source = "snapshot";
  else source = "empty";

  return { projects, source, error };
}

export async function fetchAndSnapshot(): Promise<{ projects: Project[]; updatedAt: string }> {
  const projects = await fetchProjectsFromGitHub();
  const updatedAt = new Date().toISOString();
  return { projects, updatedAt };
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
