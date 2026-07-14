import { z } from "zod";

export const IdentitySchema = z.object({
  name: z.string(),
  headline: z.string(),
  location: z.string(),
  email: z.email(),
  socials: z.object({
    github: z.string(),
    linkedin: z.string(),
    twitter: z.string(),
    leetcode: z.string(),
  }),
  passions: z.array(z.string()),
  currently: z.object({
    role: z.string(),
    training: z.array(z.string()),
    planning: z.array(z.string()),
  }),
});

export type Identity = z.infer<typeof IdentitySchema>;

export const ExperienceEntrySchema = z.object({
  company: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  location: z.string(),
  highlights: z.array(z.string()),
  stack: z.array(z.string()).default([]),
  links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
});

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

export const ExperienceSchema = z.array(ExperienceEntrySchema);

const dateToIso = z.preprocess((v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return v;
}, z.string());

export const PostFrontmatterSchema = z.object({
  title: z.string(),
  date: dateToIso,
  tags: z.array(z.string()).default([]),
  summary: z.string(),
  draft: z.boolean().default(false),
  syndicate: z.boolean().default(true),
  original_url: z.url().optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export const ProjectSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  url: z.url(),
  homepage: z.string().optional(),
  primaryLanguage: z.string().optional(),
  stars: z.number().int().nonnegative(),
  topics: z.array(z.string()).default([]),
  pushedAt: z.string(),
  pinned: z.boolean().default(false),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
  writeup: z.string().optional(),
  headline: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectSnapshotSchema = z.object({
  projects: z.array(ProjectSchema),
  updatedAt: z.string(),
});

export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;

export const ProjectOverrideSchema = z.object({
  headline: z.string().optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
  writeup: z.string().optional(),
});

export type ProjectOverride = z.infer<typeof ProjectOverrideSchema>;
