import { getCachedProjects } from "@/lib/projects-cache";

export async function GET() {
  const result = await getCachedProjects();
  return Response.json(result, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
