"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/lib/constants";

export async function setAuthCookie(
  accessToken: string,
  refreshToken?: string,
) {
  const cookieStore = await cookies();

  const secure = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  if (refreshToken)
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

  const tenantId = await decodeTenantId(accessToken);

  if (tenantId)
    cookieStore.set("tenantId", tenantId, {
      httpOnly: true,
      secure: secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
}

export async function removeAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("tenantId");
}

export async function decodeTenantId(accessToken?: string) {
  if (!accessToken) return undefined;
  try {
    const payload = jwtDecode<{ tenantId?: string }>(accessToken);
    return payload.tenantId;
  } catch {
    return undefined;
  }
}
