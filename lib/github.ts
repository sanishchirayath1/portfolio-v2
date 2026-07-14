import "server-only";

import type { Project } from "./schema";

const GITHUB_USER = "sanishchirayath1";
const GITHUB_CONTRIB_LOGINS = ["sanishchirayath1", "sanish-bruno"] as const;
const PORTFOLIO_TOPIC = "portfolio";
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

interface RepoNode {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  pushedAt: string;
  isArchived: boolean;
  isPrivate: boolean;
  primaryLanguage: { name: string } | null;
  repositoryTopics: {
    nodes: Array<{ topic: { name: string } }>;
  };
}

interface GraphQLResponse {
  data?: {
    user: {
      pinnedItems: { nodes: RepoNode[] };
      repositories: { nodes: RepoNode[] };
    };
  };
  errors?: Array<{ message: string }>;
}

const query = `
  query PortfolioRepos($login: String!) {
    user(login: $login) {
      pinnedItems(first: 12, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            stargazerCount
            pushedAt
            isArchived
            isPrivate
            primaryLanguage { name }
            repositoryTopics(first: 20) { nodes { topic { name } } }
          }
        }
      }
      repositories(
        first: 50
        privacy: PUBLIC
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          pushedAt
          isArchived
          isPrivate
          primaryLanguage { name }
          repositoryTopics(first: 20) { nodes { topic { name } } }
        }
      }
    }
  }
`;

function normalize(repo: RepoNode, pinned: boolean): Project {
  const topics = repo.repositoryTopics.nodes.map((n) => n.topic.name);
  return {
    name: repo.name,
    slug: repo.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    description: repo.description ?? "",
    url: repo.url,
    homepage: repo.homepageUrl ?? undefined,
    primaryLanguage: repo.primaryLanguage?.name,
    stars: repo.stargazerCount,
    topics,
    pushedAt: repo.pushedAt,
    pinned,
    featured: false,
    hidden: false,
  };
}

export interface ContributionWeek {
  weekStart: string;
  count: number;
}

interface ContributionsResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const contributionsQuery = `
  query Contributions($login: String!, $from: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

async function fetchContributionCalendarFor(login: string): Promise<{
  weeks: ContributionWeek[];
  total: number;
}> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");

  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 364);

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-sync",
    },
    body: JSON.stringify({
      query: contributionsQuery,
      variables: { login, from: from.toISOString() },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status} ${res.statusText} for ${login}`);
  }

  const json = (await res.json()) as ContributionsResponse;
  if (json.errors?.length) {
    throw new Error(
      `GitHub GraphQL errors for ${login}: ${json.errors.map((e) => e.message).join(", ")}`,
    );
  }
  if (!json.data) throw new Error(`GitHub GraphQL returned no data for ${login}`);

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks.map((week) => ({
    weekStart: week.contributionDays[0]?.date ?? "",
    count: week.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0),
  }));

  return { weeks, total: calendar.totalContributions };
}

export async function fetchContributionCalendar(): Promise<{
  weeks: ContributionWeek[];
  total: number;
  logins: readonly string[];
}> {
  const results = await Promise.all(GITHUB_CONTRIB_LOGINS.map(fetchContributionCalendarFor));

  const buckets = new Map<string, number>();
  let total = 0;
  for (const result of results) {
    total += result.total;
    for (const week of result.weeks) {
      if (!week.weekStart) continue;
      buckets.set(week.weekStart, (buckets.get(week.weekStart) ?? 0) + week.count);
    }
  }

  const weeks: ContributionWeek[] = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, count]) => ({ weekStart, count }));

  return {
    weeks: weeks.slice(-52),
    total,
    logins: GITHUB_CONTRIB_LOGINS,
  };
}

export async function fetchProjectsFromGitHub(): Promise<Project[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-sync",
    },
    body: JSON.stringify({
      query,
      variables: { login: GITHUB_USER },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) {
    throw new Error("GitHub GraphQL returned no data");
  }

  const pinnedRepos = json.data.user.pinnedItems.nodes;
  const allRepos = json.data.user.repositories.nodes;
  const pinnedNames = new Set(pinnedRepos.map((r) => r.name));

  const pinnedProjects = pinnedRepos
    .filter((r) => !r.isArchived && !r.isPrivate)
    .map((r) => normalize(r, true));

  const topicProjects = allRepos
    .filter((r) => !r.isArchived && !r.isPrivate)
    .filter((r) => !pinnedNames.has(r.name))
    .filter((r) => r.repositoryTopics.nodes.some((t) => t.topic.name === PORTFOLIO_TOPIC))
    .map((r) => normalize(r, false));

  return [...pinnedProjects, ...topicProjects];
}
