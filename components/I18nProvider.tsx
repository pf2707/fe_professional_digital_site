"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { DEFAULT_LOCALE, dictFor, LOCALE_COOKIE, type Dict, type Locale } from "@/lib/i18n";

type I18n = { locale: Locale; t: Dict; setLocale: (locale: Locale) => void; switching: boolean };

const Ctx = createContext<I18n>({ locale: DEFAULT_LOCALE, t: dictFor(DEFAULT_LOCALE), setLocale: () => {}, switching: false });

// The root layout reads the language cookie and passes it in. Switching writes
// the cookie and re-renders the server parts (titles, legal pages) too.
export function I18nProvider({ locale: initial, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setState] = useState(initial);
  const [switching, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      setState(next);
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo(() => ({ locale, t: dictFor(locale), setLocale, switching }), [locale, setLocale, switching]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
export const useT = () => useContext(Ctx).t;
