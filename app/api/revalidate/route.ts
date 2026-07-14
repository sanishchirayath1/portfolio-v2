import { createHmac, timingSafeEqual } from "node:crypto";
import { PROJECTS_CACHE_TAG } from "@/lib/projects-cache";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

const VERIFY_EVENTS = new Set(["push", "repository", "star", "public", "meta", "ping"]);

function verifySignature(secret: string, body: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifySignature(secret, body, signature)) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event === "ping") {
    return Response.json({ ok: true, pong: true });
  }

  if (!event || !VERIFY_EVENTS.has(event)) {
    return Response.json({ ok: true, skipped: event ?? "unknown" });
  }

  revalidateTag(PROJECTS_CACHE_TAG);
  return Response.json({ ok: true, revalidated: PROJECTS_CACHE_TAG, event });
}
