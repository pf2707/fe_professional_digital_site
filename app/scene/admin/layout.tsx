import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import "./admin.css";

// Everything under /scene/admin edits the signed-in user's CV.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <RequireAuth>{children}</RequireAuth>
      </Suspense>
    </AuthProvider>
  );
}
