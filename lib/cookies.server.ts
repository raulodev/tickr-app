import { CO0KIE_OPTIONS, decodeTenantId } from "@/lib/cookies";
import { cookies } from "next/headers";

const DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Equivalente servidor de `lib/cookies.ts`: `js-cookie` solo escribe en
 * `document.cookie`.Los tokens se escriben aquí con la API de
 * cookies de Next para que la respuesta del callback los envíe al navegador.
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    ...CO0KIE_OPTIONS,
    maxAge: DAY_IN_SECONDS,
  });

  if (refreshToken)
    cookieStore.set("refreshToken", refreshToken, {
      ...CO0KIE_OPTIONS,
      maxAge: 30 * DAY_IN_SECONDS,
    });

  const tenantId = decodeTenantId(accessToken);

  if (tenantId)
    cookieStore.set("tenantId", tenantId, {
      ...CO0KIE_OPTIONS,
      maxAge: 30 * DAY_IN_SECONDS,
    });
}

export async function removeAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("tenantId");
}
