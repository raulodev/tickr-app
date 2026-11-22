export const ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const SECURE = process.env.NODE_ENV === "production";

export const CO0KIE_OPTIONS = {
  httpOnly: true,
  secure: SECURE,
  sameSite: "lax" as const,
  path: "/",
};
