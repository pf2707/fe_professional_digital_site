import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { DraftPreview } from "@/components/admin/DraftPreview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.editor.metaPreview, robots: { index: false, follow: false } };
}

export default async function PreviewPage(props: PageProps<"/scene/admin/preview">) {
  const { view, flow } = await props.searchParams;
  return <DraftPreview view={view === "cv" ? "cv" : "studio"} flow={flow === "1"} />;
}
