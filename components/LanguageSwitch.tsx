"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

// EN / VI. Each option is named in its own language.
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, t, setLocale, switching } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t.language.label} aria-busy={switching}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          aria-label={t.language[l]}
          title={t.language[l]}
          onClick={() => l !== locale && setLocale(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
