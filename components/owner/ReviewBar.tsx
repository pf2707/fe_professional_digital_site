"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { approve, setTwin } from "@/app/owner/actions";

// Shown over a pending CV when the site owner is looking at it.
export function ReviewBar({ slug, owner, twin }: { slug: string; owner: string; twin: boolean }) {
  const [pending, start] = useTransition();
  // The switch moves at once; the page redraws with or without the twin when the save lands.
  const [twinOn, setTwinOn] = useOptimistic(twin);
  const toggleTwin = (on: boolean) =>
    start(async () => {
      setTwinOn(on);
      await setTwin(slug, on);
    });

  return (
    <div className="review-bar" role="region" aria-label="Review this CV">
      <Link href="/owner" className="review-back">
        ← Pending CVs
      </Link>
      <p>
        <strong>Waiting for approval</strong>
        <span>{owner}</span>
      </p>
      <label className="review-twin">
        <input type="checkbox" checked={twinOn} onChange={(e) => toggleTwin(e.target.checked)} disabled={pending} />
        Digital twin
      </label>
      <button
        type="button"
        onClick={() => window.confirm(`Approve /scene/${slug}? It goes live straight away.`) && start(() => approve(slug))}
        disabled={pending}
      >
        Approve
      </button>
    </div>
  );
}
