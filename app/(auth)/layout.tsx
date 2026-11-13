import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "../scene/admin/admin.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>{children}</Suspense>
    </AuthProvider>
  );
}
