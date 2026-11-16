import Image from "next/image";
import Link from "next/link";
import { longDate } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/server";
import { LEGAL_UPDATED, type LegalDoc } from "@/lib/legal";
import { LanguageSwitch } from "./LanguageSwitch";
import { SiteFooter } from "./SiteFooter";

// /privacy and /terms: a contents list beside the document.
export async function LegalPage({ doc, page }: { doc: LegalDoc; page: "privacy" | "terms" }) {
  const t = await getDict();
  const id = (i: number) => `s${i + 1}`;
  return (
    <div className="legal">
      <header className="legal-top">
        <Link href="/" className="hero-brand">
          <Image src="/icon.svg" alt="" width={30} height={30} unoptimized />
          {t.site.name}
        </Link>
        <LanguageSwitch className="on-paper" />
      </header>

      <main className="legal-main">
        <h1>{doc.title}</h1>
        <p className="legal-updated">{t.legal.updated(longDate(t, LEGAL_UPDATED))}</p>
        <p className="legal-lede">{doc.lede}</p>

        <div className="legal-body">
          <nav className="legal-toc" aria-label={doc.title}>
            <ol>
              {doc.sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#${id(i)}`}>{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div>
            {doc.sections.map((s, i) => (
              <section key={s.title} id={id(i)} aria-labelledby={`${id(i)}-h`}>
                <h2 id={`${id(i)}-h`}>{s.title}</h2>
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j}>
                      {b.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  ),
                )}
              </section>
            ))}
            <p className="legal-other">
              <Link href={page === "privacy" ? "/terms" : "/privacy"}>{t.legal.otherPage[page]}</Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
