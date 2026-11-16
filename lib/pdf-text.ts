// The text of a CV PDF, read in the browser with pdf.js. Only this text goes
// to /api/import-cv: the PDF itself never leaves the browser and is never stored.

export const MAX_PDF_MB = 10;
// Far more than any CV; keeps the request (and the model bill) small.
export const MAX_CV_CHARS = 60_000;

export async function pdfText(file: File): Promise<string> {
  // The legacy build: the modern one needs JavaScript only the newest browsers
  // have (Map.getOrInsertComputed, Math.sumPrecise) and fails to open any PDF elsewhere.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const pages: string[] = [];
    const links = new Set<string>();
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const { items } = await page.getTextContent();
      // Keep the PDF's line breaks so headings and dates stay on their own lines.
      pages.push(items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : "") : "")).join(""));
      // Links often show only a name ("LinkedIn"); the address is in the annotation.
      for (const a of await page.getAnnotations()) if (typeof a.url === "string") links.add(a.url);
    }
    const text = pages.join("\n\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    const withLinks = links.size ? `${text}\n\nLinks in the CV:\n${[...links].join("\n")}` : text;
    return withLinks.slice(0, MAX_CV_CHARS);
  } finally {
    await doc.destroy();
  }
}
