import { buildJsonFeed } from "@/lib/feed";

export async function GET() {
  const body = await buildJsonFeed();
  return new Response(body, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
