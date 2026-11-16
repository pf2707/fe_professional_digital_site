import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLocale } from "@/lib/i18n/server";
import { privacyDoc } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const doc = privacyDoc(await getLocale());
  return { title: `${doc.title} · Interactive 3D CV`, description: doc.lede };
}

export default async function PrivacyPage() {
  return <LegalPage doc={privacyDoc(await getLocale())} page="privacy" />;
}
