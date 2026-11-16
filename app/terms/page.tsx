import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLocale } from "@/lib/i18n/server";
import { termsDoc } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const doc = termsDoc(await getLocale());
  return { title: `${doc.title} · Interactive 3D CV`, description: doc.lede };
}

export default async function TermsPage() {
  return <LegalPage doc={termsDoc(await getLocale())} page="terms" />;
}
