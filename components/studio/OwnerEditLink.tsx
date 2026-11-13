"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

// "Edit" on a published CV, shown only to the account that owns it. Visitors
// don't see it.
export function OwnerEditLink({ ownerUid }: { ownerUid: string }) {
  const { user } = useAuth();
  if (user?.uid !== ownerUid) return null;
  return (
    <Link href="/scene/admin" className="hud-link">
      Edit
    </Link>
  );
}
