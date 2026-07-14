import "server-only";

import { unstable_cache } from "next/cache";
import { type ProjectsResult, loadProjects } from "./projects";

export const PROJECTS_CACHE_TAG = "github:projects";

export const getCachedProjects: () => Promise<ProjectsResult> = unstable_cache(
  async () => loadProjects(),
  ["github:projects"],
  {
    revalidate: 600,
    tags: [PROJECTS_CACHE_TAG],
  },
);
