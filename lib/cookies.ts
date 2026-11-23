import { jwtDecode } from "jwt-decode";
import cookies from "js-cookie";

const SECURE = process.env.NODE_ENV === "production";

export const CO0KIE_OPTIONS = {
  secure: SECURE,
  sameSite: "lax" as const,
  path: "/",
};

export function removeAuthCookies() {
  cookies.remove("accessToken");
  cookies.remove("refreshToken");
  cookies.remove("tenantId");
}

export function setAuthCookies(accessToken: string, refreshToken?: string) {
  cookies.set("accessToken", accessToken, {
    ...CO0KIE_OPTIONS,
    expires: 1,
  });

  if (refreshToken)
    cookies.set("refreshToken", refreshToken, {
      ...CO0KIE_OPTIONS,
      expires: 30,
    });

  const tenantId = decodeTenantId(accessToken);

  if (tenantId)
    cookies.set("tenantId", tenantId, {
      ...CO0KIE_OPTIONS,
      expires: 30,
    });
}

export function getCookies() {
  const accessToken = cookies.get("accessToken");
  const isAccessTokenExpired = isTokenExpired(accessToken);

  const refreshToken = cookies.get("refreshToken");
  const tenantId = cookies.get("tenantId");
  const locale = cookies.get("locale");

  return { accessToken, refreshToken, tenantId, locale, isAccessTokenExpired };
}

function isTokenExpired(accessToken: string | undefined) {
  if (!accessToken) return true;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(accessToken);
    if (!exp) return false;
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function decodeTenantId(accessToken?: string) {
  if (!accessToken) return undefined;
  try {
    const payload = jwtDecode<{ tenantId?: string }>(accessToken);
    return payload.tenantId;
  } catch {
    return undefined;
  }
}
