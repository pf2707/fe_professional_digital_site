import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canEdit, UPLOAD_DIR } from "@/lib/admin-store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

// POST a form with a `file` field → saves to public/uploads/ and returns its URL path.
export async function POST(req: Request) {
  if (!canEdit()) {
    return new Response("Uploading is only available when running `npm run dev` locally.", { status: 403 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return new Response("No file was attached.", { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return new Response("Use a PNG, JPEG or WebP image.", { status: 415 });
  if (file.size > MAX_BYTES) return new Response("Images must be 5 MB or smaller.", { status: 413 });

  const base = path
    .basename(file.name, path.extname(file.name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";
  const name = `${base}-${Date.now().toString(36)}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ path: `/uploads/${name}` });
}
