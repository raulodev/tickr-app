"use server";

import { cookies } from "next/headers";

const SUPPORTED_LOCALES = ["en", "es"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export async function setLocale(nextLocale: string) {
  // Never trust client input: validate on the server too
  if (!isLocale(nextLocale)) return;

  const cookieStore = await cookies(); // "await" is required in Next 15+
  cookieStore.set("locale", nextLocale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true, // the client no longer needs to read it
  });
}
