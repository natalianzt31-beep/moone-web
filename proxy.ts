import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CANONICAL_HOST } from "@/lib/site";

/**
 * El sitio se sirve también desde el alias *.vercel.app (y desde previews
 * de rama) además del dominio definitivo. Para que Google solo indexe
 * moone.com.uy, cualquier otro host recibe X-Robots-Tag: noindex.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const host = (request.headers.get("host") ?? request.nextUrl.hostname).split(":")[0];
  if (host !== CANONICAL_HOST) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
