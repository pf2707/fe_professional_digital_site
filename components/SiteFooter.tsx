import Image from "next/image";
import Link from "next/link";
import { COMPANY, CONTACT } from "@/lib/business";
import { getDict } from "@/lib/i18n/server";
import { LanguageSwitch } from "./LanguageSwitch";

const MAKE = "/register?next=/scene/admin";

// The full footer, on the landing and legal pages. Everywhere else the root
// layout's one-line footer is enough (and over the 3D studio, all there's room for).
export async function SiteFooter() {
  const t = await getDict();
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <div className="site-foot-brand">
          <Link href="/" className="site-foot-logo">
            <Image src="/icon.svg" alt="" width={30} height={30} unoptimized />
            {t.site.name}
          </Link>
          <p>{t.footer.tagline}</p>
          <LanguageSwitch className="on-paper" />
        </div>
        <nav aria-label={t.footer.product}>
          <h2>{t.footer.product}</h2>
          <ul>
            <li>
              <Link href="/scene">{t.footer.explore}</Link>
            </li>
            <li>
              <Link href="/#places-title">{t.footer.allPlaces}</Link>
            </li>
            <li>
              <Link href={MAKE}>{t.footer.make}</Link>
            </li>
            <li>
              <Link href="/login?next=/scene/admin">{t.footer.signIn}</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label={t.footer.legal}>
          <h2>{t.footer.legal}</h2>
          <ul>
            <li>
              <Link href="/privacy">{t.footer.privacy}</Link>
            </li>
            <li>
              <Link href="/terms">{t.footer.terms}</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2>{t.footer.contact}</h2>
          <ul>
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>
        </div>
        <p className="site-foot-copy">{t.footer.copyright(COMPANY)}</p>
      </div>
    </footer>
  );
}
