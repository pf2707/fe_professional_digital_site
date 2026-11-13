import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroRoom } from "@/components/landing/HeroRoom";
import { placeById, type PlaceId } from "@/lib/places";
import { sampleProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "3D CV — your CV as a room people can walk into",
  description:
    "Turn your CV into an interactive 3D room: projects on the monitor, skills in the server rack, certificates on the wall, and an AI twin that answers questions about you.",
};

const MAKE = "/register?next=/scene/admin";

// The places section: each place as the sample CV looks there (images in
// public/places, captured from /scene in the colours named here; the link opens
// the same look).
const SHOWN: { id: PlaceId; design: string; what: string; alt: string }[] = [
  {
    id: "room",
    design: "studio",
    what: "Projects on the monitor, skills in the server rack, the career pinned to a corkboard.",
    alt: "A home studio at night: desk and monitor, server rack, filing cabinet, framed certificates and an armchair.",
  },
  {
    id: "cafe",
    design: "sakura",
    what: "Projects on the chalkboard menu, skills in jars on the shelves, the career on a photo wall.",
    alt: "A brick-walled café in pink light: counter with espresso machine, jar shelves, chalkboard menu and bistro tables.",
  },
  {
    id: "park",
    design: "forest",
    what: "Projects on the notice board, skills in the flower beds, the career on a signpost.",
    alt: "A pocket park at dusk: fountain, garden shed, signpost, notice board, flower beds, a bench and a red phone box.",
  },
  {
    id: "shop",
    design: "cyber",
    what: "Projects on a poster in the window, skills on the shelves, the career on a wall calendar.",
    alt: "A corner shop in neon light: window poster, stocked shelves, wall clock and calendar, the till and stockroom boxes.",
  },
];

export default function Home() {
  return (
    <div className="landing">
      <section className="hero">
        <HeroRoom profile={sampleProfile} />

        <header className="hero-top">
          <Link href="/" className="hero-brand">
            3D CV
          </Link>
          <Link href="/login?next=/scene/admin" className="hero-signin">
            Sign in
          </Link>
        </header>

        <div className="hero-copy">
          <h1>Hand recruiters a room, not a PDF.</h1>
          <p>
            Your projects, skills and certificates become things people click, in a studio, a coffee shop, a park or a
            shop, in the colours you choose. An AI twin of you answers visitors&apos; questions.
          </p>
          <Link href="/scene" className="hero-cta">
            Step inside the room
          </Link>
          <Link href={MAKE} className="hero-make">
            Make your own 3D CV
          </Link>
        </div>
      </section>

      <section className="places" aria-labelledby="places-title">
        <h2 id="places-title">Set your CV somewhere that feels like you</h2>
        <p className="places-lede">Every place shows the same CV, on objects that belong there.</p>
        <ul>
          {SHOWN.map(({ id, design, what, alt }) => {
            const place = placeById(id);
            return (
              <li key={id}>
                <Link href={`/scene?place=${id}&design=${design}`} className="place-card">
                  <Image src={`/places/${place.id}.webp`} alt={alt} width={1170} height={780} sizes="(max-width: 820px) 100vw, 520px" />
                  <h3>{place.name}</h3>
                  <p>{what}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <h2 id="steps-title">From form to room in three steps</h2>
        <ol>
          <li>
            <h3>Fill in your CV</h3>
            <p>Your career, skills, certificates and projects, plus a photo. Pick a place and its colours, and watch it update as you type.</p>
          </li>
          <li>
            <h3>Choose your address</h3>
            <p>
              Reserve a link like <code>/scene/your-name</code>, then contact us to publish it.
            </p>
          </li>
          <li>
            <h3>Go live</h3>
            <p>Once approved, your room is live at your address. Share it on LinkedIn, in emails, on your printed CV.</p>
          </li>
        </ol>
        <Link href={MAKE} className="steps-cta">
          Make your own 3D CV
        </Link>
      </section>
    </div>
  );
}
