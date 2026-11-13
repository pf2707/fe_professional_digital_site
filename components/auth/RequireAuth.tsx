"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { firebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "./AuthProvider";

// Shows its children only to a signed-in user; sends everyone else to /login
// and back here afterwards.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();

  useEffect(() => {
    if (firebaseConfigured && !loading && !user) {
      const next = pathname + (query ? `?${query}` : "");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, pathname, query, router]);

  if (!firebaseConfigured)
    return (
      <main className="notice">
        <h1>Sign-in isn&apos;t set up yet</h1>
        <p>
          Add the Firebase web app config (the <code>NEXT_PUBLIC_FIREBASE_*</code> values) to <code>.env.local</code> and
          restart the server.
        </p>
      </main>
    );
  if (!user) return <div className="admin-empty">Loading…</div>;
  return children;
}
