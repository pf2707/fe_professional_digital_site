import "server-only";
import { cookies, headers } from "next/headers";
import { dictFor, isLocale, LOCALE_COOKIE, localeFromHeader, type Locale } from ".";

// The visitor's language: their choice (the cookie), else their browser's.
export async function getLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return localeFromHeader((await headers()).get("accept-language"));
}

export async function getDict() {
  return dictFor(await getLocale());
}
