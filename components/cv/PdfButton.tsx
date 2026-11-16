"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import type { Profile } from "@/lib/profile";

// Downloads the text CV as a PDF file (lib/cv-pdf.tsx), on phones too.
export function PdfButton({ profile }: { profile: Profile }) {
  const t = useT();
  const [state, setState] = useState<"idle" | "making" | "failed">("idle");

  const download = async () => {
    setState("making");
    try {
      const { cvPdf } = await import("@/lib/cv-pdf");
      const url = URL.createObjectURL(await cvPdf(profile, t));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.name || "CV"} - CV.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setState("idle");
    } catch {
      setState("failed");
    }
  };

  return (
    <p className="doc-pdf">
      <button type="button" onClick={download} disabled={state === "making"}>
        {state === "making" ? t.textCv.making : t.textCv.download}
      </button>
      {state === "failed" && <span role="alert">{t.textCv.pdfFailed}</span>}
    </p>
  );
}
