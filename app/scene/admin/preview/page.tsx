import type { Metadata } from "next";
import { DraftPreview } from "@/components/admin/DraftPreview";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage(props: PageProps<"/scene/admin/preview">) {
  const { view } = await props.searchParams;
  return <DraftPreview view={view === "cv" ? "cv" : "studio"} />;
}
