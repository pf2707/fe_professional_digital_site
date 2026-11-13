"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

// Goes back to the previous screen. Opened directly (a shared link, a new
// tab), there's nothing to go back to, so it goes to `fallback` instead.
export function BackButton({
  fallback,
  className,
  label,
  confirm,
  children,
}: {
  fallback: string;
  className?: string;
  label?: string;
  confirm?: () => boolean; // return false to stay
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => {
        if (confirm && !confirm()) return;
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
    >
      {children}
    </button>
  );
}
