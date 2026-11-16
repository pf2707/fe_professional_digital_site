import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

// Shown at /<slug> while a CV waits for the owner's approval.
export async function PendingCv() {
  const t = (await getDict()).pending;
  return (
    <main className="notice">
      <h1>{t.title}</h1>
      <p>{t.text}</p>
      <Link href="/" className="btn-solid">
        {t.home}
      </Link>
    </main>
  );
}
