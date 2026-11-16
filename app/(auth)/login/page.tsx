import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { AuthForm } from "@/components/auth/AuthForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.auth.signInTitle, robots: { index: false, follow: false } };
}

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
