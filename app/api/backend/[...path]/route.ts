import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const FORWARDED_HEADERS = ["accept", "content-type"];

async function proxy(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  if (!API_URL) {
    return NextResponse.json({ message: "API URL is not configured" }, { status: 500 });
  }

  const { path } = await context.params;
  const token = (await cookies()).get("accessToken")?.value;
  const headers = new Headers();

  for (const header of FORWARDED_HEADERS) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);

  const url = new URL(path.join("/"), API_URL);
  url.search = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
