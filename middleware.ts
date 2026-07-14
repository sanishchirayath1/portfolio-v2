import { type NextRequest, NextResponse } from "next/server";

const CLI_UA_PATTERN = /(?:curl|Wget|HTTPie|PowerShell|python-requests|Go-http-client|httpx)\//i;

function prefersPlaintext(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  if (CLI_UA_PATTERN.test(ua)) return true;
  const accept = request.headers.get("accept") ?? "";
  if (!accept) return false;
  const hasText = accept.includes("text/plain");
  const hasHtml = accept.includes("text/html");
  return hasText && !hasHtml;
}

export function middleware(request: NextRequest) {
  if (prefersPlaintext(request)) {
    return NextResponse.rewrite(new URL("/plaintext", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
