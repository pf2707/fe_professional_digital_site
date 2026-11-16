"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/I18nProvider";

// "Edit" on a published CV, shown only to the account that owns it. Visitors
// don't see it.
export function OwnerEditLink({ ownerUid }: { ownerUid: string }) {
  const { user } = useAuth();
  const t = useT();
  if (user?.uid !== ownerUid) return null;
  return (
    <Link href="/scene/admin" className="hud-link">
      {t.scene.edit}
    </Link>
  );
}
