import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has("accessToken");
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasToken && !isPublic)
    return NextResponse.redirect(new URL("/login", req.url));
  if (hasToken && pathname.startsWith("/login"))
    return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
