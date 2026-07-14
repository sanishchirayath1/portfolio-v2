import "server-only";

import { unstable_cache } from "next/cache";
import { type ContributionWeek, fetchContributionCalendar } from "./github";

export const CONTRIBUTIONS_CACHE_TAG = "github:contributions";

export type ContributionResult =
  | {
      weeks: ContributionWeek[];
      total: number;
      logins: readonly string[];
      source: "live";
      error: null;
    }
  | { weeks: []; total: 0; logins: []; source: "error"; error: string };

export const getContributionSparkline: () => Promise<ContributionResult> = unstable_cache(
  async () => {
    try {
      const { weeks, total, logins } = await fetchContributionCalendar();
      return { weeks, total, logins, source: "live", error: null };
    } catch (err) {
      return {
        weeks: [],
        total: 0,
        logins: [],
        source: "error",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  },
  ["github:contributions:v2"],
  { revalidate: 60 * 60 * 24, tags: [CONTRIBUTIONS_CACHE_TAG] },
);
