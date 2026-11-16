import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeroRoom } from "@/components/landing/HeroRoom";
import { HeroAccount, MakeLink } from "@/components/landing/LandingLinks";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { SiteFooter } from "@/components/SiteFooter";
import { placeIn } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/server";
import { placeById, type PlaceId } from "@/lib/places";
import { sampleProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.landing.metaTitle, description: t.landing.metaDescription };
}

// The places section: each place as the sample CV looks there (images in
// public/places, captured from /scene in the colours named here; the link opens
// the same look). Their words are in lib/i18n, under landing.places.
const SHOWN: { id: PlaceId; design: string }[] = [
  { id: "room", design: "studio" },
  { id: "cafe", design: "sakura" },
  { id: "park", design: "forest" },
  { id: "shop", design: "cyber" },
];

// "Reserve a link like /scene/your-name": the path set as code.
const withPaths = (text: string) =>
  text
    .split(/(\/scene\/[\w-]+)/)
    .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));

export default async function Home() {
  const t = await getDict();
  const l = t.landing;
  return (
    <AuthProvider>
      <div className="landing">
        <section className="hero">
          <HeroRoom profile={sampleProfile} />

          <header className="hero-top">
            <Link href="/" className="hero-brand">
              <Image
                src="/icon.svg"
                alt=""
                width={34}
                height={34}
                unoptimized
                priority
              />
              {t.site.name}
            </Link>
            <div className="hero-top-end">
              <LanguageSwitch className="on-sky" />
              <HeroAccount />
            </div>
          </header>

          <div className="hero-copy">
            <h1>
              <span>{l.headline[0]}</span> <span>{l.headline[1]}</span>
            </h1>
            <p>{l.lede}</p>
            <Link href="/scene" className="hero-cta">
              {l.cta}
            </Link>
            <MakeLink className="hero-make" />
          </div>
        </section>

        <section className="places" aria-labelledby="places-title">
          <h2 id="places-title">{l.placesTitle}</h2>
          <p className="places-lede">{l.placesLede}</p>
          <ul>
            {SHOWN.map(({ id, design }) => {
              const place = placeIn(t, placeById(id));
              return (
                <li key={id}>
                  <Link
                    href={`/scene?place=${id}&design=${design}`}
                    className="place-card"
                  >
                    <Image
                      src={`/places/${place.id}.webp`}
                      alt={l.places[id].alt}
                      width={1170}
                      height={780}
                      sizes="(max-width: 820px) 100vw, 520px"
                    />
                    <h3>{place.name}</h3>
                    <p>{l.places[id].what}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/scene" className="places-all">
            {l.placesAll}
          </Link>
        </section>

        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">{l.stepsTitle}</h2>
          <ol>
            {l.steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{withPaths(step.text)}</p>
              </li>
            ))}
          </ol>
          <MakeLink className="steps-cta" />
        </section>

        <SiteFooter />
      </div>
    </AuthProvider>
  );
}
