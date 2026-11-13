import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
