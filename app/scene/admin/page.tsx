import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { AdminEditor } from "@/components/admin/AdminEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.editor.metaEdit, robots: { index: false, follow: false } };
}

export default function AdminPage() {
  return <AdminEditor />;
}
