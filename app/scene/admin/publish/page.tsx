import type { Metadata } from "next";
import { PublishFlow } from "@/components/admin/PublishFlow";

export const metadata: Metadata = {
  title: "Publish your CV",
  robots: { index: false, follow: false },
};

export default function PublishPage() {
  return <PublishFlow />;
}
