"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import {
  CO0KIE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/constants";

export async function setAuthCookie(
  accessToken: string,
  refreshToken?: string,
) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    ...CO0KIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  if (refreshToken)
    cookieStore.set("refreshToken", refreshToken, {
      ...CO0KIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

  const tenantId = await decodeTenantId(accessToken);

  if (tenantId)
    cookieStore.set("tenantId", tenantId, {
      ...CO0KIE_OPTIONS,
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
