"use client";

// The landing page's account-aware links. Firebase knows on load whether
// someone is signed in; until it does, Sign in holds its place unseen.

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/I18nProvider";

export function HeroAccount() {
  const { user, loading } = useAuth();
  const l = useT().landing;
  if (user)
    return (
      <Link href="/scene/admin" className="hero-signin">
        {l.myCv}
      </Link>
    );
  return (
    <Link href="/login?next=/scene/admin" className="hero-signin" style={loading ? { visibility: "hidden" } : undefined}>
      {l.signIn}
    </Link>
  );
}

// Signed in: their own CV in the room (/scene opens the editor if they have none yet).
export function MakeLink({ className }: { className: string }) {
  const { user } = useAuth();
  const l = useT().landing;
  return (
    <Link href={user ? "/scene?mine=1" : "/register?next=/scene/admin"} className={className}>
      {l.make}
    </Link>
  );
}
