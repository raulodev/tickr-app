import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAccessTokenToken = req.cookies.has("accessToken");
  const hasRefreshToken = req.cookies.has("refreshToken");

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasAccessTokenToken && !isPublic && !hasRefreshToken)
    return NextResponse.redirect(new URL("/login", req.url));
  if (hasAccessTokenToken && pathname.startsWith("/login"))
    return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
