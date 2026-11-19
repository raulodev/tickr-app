"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function setAuthCookie(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  const secure = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const decoded = jwtDecode(accessToken);

  cookieStore.set("tenantId", (decoded as { tenantId: string }).tenantId, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function removeAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("tenantId");
}
