import { buildRssXml } from "@/lib/feed";

export async function GET() {
  const body = await buildRssXml();
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
