import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { authControllerRefresh } from "@/generated/api";
import { isAxiosError } from "axios";
import { AuthSessionResponseDto } from "@/generated/api/model";
import { setAuthCookie } from "@/features/auth/actions";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const FORWARDED_HEADERS = ["accept", "content-type"];

async function getRequestParams(
  request: NextRequest,
  context: RouteContext<"/api/backend/[...path]">,
) {
  const { path } = await context.params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  const headers = new Headers();

  for (const header of FORWARDED_HEADERS) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const url = new URL(path.join("/"), API_URL);

  url.search = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  return {
    url,
    params: {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    } as RequestInit,
  };
}

async function getResponse(
  request: NextRequest,
  context: RouteContext<"/api/backend/[...path]">,
) {
  const params = await getRequestParams(request, context);
  const response = await fetch(params.url, { ...params.params });
  return response;
}

async function refreshToken() {
  const refreshToken = (await cookies()).get("refreshToken")?.value;
  const tenantId = (await cookies()).get("tenantId")?.value;

  if (!refreshToken || !tenantId) {
    console.log(
      "Cannot refresh token current refreshToken or tenantId is undefined",
    );
    return false;
  }

  try {
    const response = await authControllerRefresh(
      {
        refreshToken: refreshToken,
        tenantId: tenantId,
      },
      {
        baseURL: API_URL,
      },
    );
    await setAuthCookie(response.access_token, response.refresh_token);
    return true;
  } catch (error) {
    if (!isAxiosError<AuthSessionResponseDto>(error)) {
      throw error;
    }
    console.error("Failed refresh token:", error.response?.data);
  }
  return false;
}

async function proxy(
  request: NextRequest,
  context: RouteContext<"/api/backend/[...path]">,
) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "API URL is not configured" },
      { status: 500 },
    );
  }

  let response = await getResponse(request, context);

  if (response.status === 401) {
    const isUpdatedAccesToken = await refreshToken();
    if (isUpdatedAccesToken) {
      response = await getResponse(request, context);
    }
  }

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
