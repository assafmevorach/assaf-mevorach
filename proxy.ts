import { NextRequest, NextResponse } from "next/server";
import { authenticated, COOKIE } from "./app/foundry/_lib/auth";

export async function proxy(request: NextRequest) {
  let response: NextResponse;
  try {
    response = request.nextUrl.pathname !== "/foundry/login" && !await authenticated(request.cookies.get(COOKIE)?.value)
      ? NextResponse.redirect(new URL("/foundry/login", request.url)) : NextResponse.next();
  } catch {
    response = new NextResponse("Foundry storage is unavailable. Try again later.", { status: 503 });
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
export const config = { matcher: ["/foundry/:path*"] };
