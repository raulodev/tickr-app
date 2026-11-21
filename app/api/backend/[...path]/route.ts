import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { authControllerRefresh } from "@/generated/api";
import { isAxiosError } from "axios";
import { decodeTenantId } from "@/features/auth/actions";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/lib/constants";
import type {
  ApiErrorResponseDto,
  AuthSessionResponseDto,
} from "@/generated/api/model";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const FORWARDED_HEADERS = ["accept", "content-type"];

async function applyAuthCookies(
  response: NextResponse,
  session: AuthSessionResponseDto,
  currentTenantId?: string,
) {
  const secure = process.env.NODE_ENV === "production";
  const baseOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set("accessToken", session.access_token, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  response.cookies.set("refreshToken", session.refresh_token, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  const tenantId =
    (await decodeTenantId(session.access_token)) ?? currentTenantId;

  if (tenantId) {
    response.cookies.set("tenantId", tenantId, {
      ...baseOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

async function doRefresh(
  refreshToken: string,
  tenantId: string,
): Promise<AuthSessionResponseDto | null> {
  try {
    const session = await authControllerRefresh(
      { refreshToken, tenantId },
      { baseURL: API_URL },
    );

    if (!session?.access_token || !session?.refresh_token) {
      console.error("Failed refresh token: response without tokens", session);
      return null;
    }

    return session;
  } catch (error) {
    if (!isAxiosError<ApiErrorResponseDto>(error)) throw error;
    console.error("Failed refresh token:", error.response?.data);
    return null;
  }
}

/**
 * El backend rota el refresh token en cada refresh. Varias peticiones que
 * fallan con 401 a la vez reutilizarían el mismo token viejo y el backend
 * responde "session is no longer valid", así que se comparte una única
 * petición de refresh en vuelo por refresh token.
 */
const pendingRefreshes = new Map<
  string,
  Promise<AuthSessionResponseDto | null>
>();

function refreshToken(refreshToken?: string, tenantId?: string) {
  if (!refreshToken || !tenantId) {
    console.log(
      "Cannot refresh token: current refreshToken or tenantId is undefined",
    );
    return Promise.resolve(null);
  }

  const pending = pendingRefreshes.get(refreshToken);
  if (pending) return pending;

  const request = doRefresh(refreshToken, tenantId).finally(() => {
    pendingRefreshes.delete(refreshToken);
  });

  pendingRefreshes.set(refreshToken, request);
  return request;
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

  const { path } = await context.params;
  const url = new URL(path.join("/"), API_URL);
  url.search = request.nextUrl.search;

  // El body se lee una sola vez para poder reenviarlo tras el refresh
  // (leerlo de nuevo desde `request` falla porque ya está consumido).
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const cookieStore = await cookies();
  const currentAccessToken = cookieStore.get("accessToken")?.value;
  const currentRefreshToken = cookieStore.get("refreshToken")?.value;
  const currentTenantId =
    cookieStore.get("tenantId")?.value ??
    (await decodeTenantId(currentAccessToken));

  const send = (accessToken?: string) => {
    const headers = new Headers();
    for (const header of FORWARDED_HEADERS) {
      const value = request.headers.get(header);
      if (value) headers.set(header, value);
    }
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

    return fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  };

  let response = await send(currentAccessToken);
  let session: AuthSessionResponseDto | null = null;

  if (response.status === 401) {
    session = await refreshToken(currentRefreshToken, currentTenantId);

    if (session) {
      await response.body?.cancel().catch(() => {});
      response = await send(session.access_token);
    }
  }

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  const proxiedResponse = new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });

  if (session) {
    await applyAuthCookies(proxiedResponse, session, currentTenantId);
  }

  return proxiedResponse;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
