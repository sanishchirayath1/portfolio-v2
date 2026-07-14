import { loadExperience, loadIdentity } from "@/lib/content";
import { renderResume } from "@/lib/plaintext";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const [identity, experience] = await Promise.all([loadIdentity(), loadExperience()]);
  const body = renderResume(identity, experience);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
