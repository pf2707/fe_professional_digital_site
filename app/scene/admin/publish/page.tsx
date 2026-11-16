import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { PublishFlow } from "@/components/admin/PublishFlow";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.publish.metaTitle, robots: { index: false, follow: false } };
}

export default function PublishPage() {
  return <PublishFlow />;
}
