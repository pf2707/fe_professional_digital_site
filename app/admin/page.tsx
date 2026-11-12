import type { Metadata } from "next";
import { AdminEditor } from "@/components/admin/AdminEditor";
import "./admin.css";

export const metadata: Metadata = {
  title: "Edit CV",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminEditor />;
}
