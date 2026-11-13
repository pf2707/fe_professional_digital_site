import type { Metadata } from "next";
import Link from "next/link";
import { HeroRoom } from "@/components/landing/HeroRoom";
import { sampleProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "3D CV — your CV as a room people can walk into",
  description:
    "Turn your CV into an interactive 3D room: projects on the monitor, skills in the server rack, certificates on the wall, and an AI twin that answers questions about you.",
};

const MAKE = "/register?next=/scene/admin";

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
            Your projects glow on the monitor, your skills fill the server rack, your certificates hang on the wall. An AI twin of
            you answers visitors&apos; questions.
          </p>
          <Link href="/scene" className="hero-cta">
            Step inside the room
          </Link>
          <Link href={MAKE} className="hero-make">
            Make your own 3D CV
          </Link>
        </div>
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <h2 id="steps-title">From form to room in three steps</h2>
        <ol>
          <li>
            <h3>Fill in your CV</h3>
            <p>Your career, skills, certificates and projects, plus a photo. Pick a room design and watch it update as you type.</p>
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
