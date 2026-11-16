import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Be_Vietnam_Pro, Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeProvider } from "@/components/ThemeProvider";
import { COMPANY } from "@/lib/business";
import { getDict, getLocale } from "@/lib/i18n/server";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["wdth", "opsz"],
  variable: "--font-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

// Instrument Sans has no Vietnamese letters, so Vietnamese pages use this for
// body text instead (globals.css, :lang(vi)). Not preloaded: English pages never need it.
const bodyVi = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-vi",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.site.name, description: t.site.description };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1b33",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getDict();
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${bodyVi.variable}`} suppressHydrationWarning>
      <body>
        <I18nProvider locale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
          {/* The one-line footer; the landing and legal pages have the full one (components/SiteFooter.tsx). */}
          <footer className="site-footer">
            <span>{t.footer.copyright(COMPANY)}</span>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
            <LanguageSwitch />
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
