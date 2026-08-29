import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { newId } from "@/lib/id";

/**
 * Where uploaded files are written. Defaults to a top-level `uploads/`
 * folder (NOT inside `public/`, since files are served through the
 * `/uploads/[filename]` route handler rather than Next's static file
 * serving — that keeps local dev and any persistent-disk production setup
 * on the exact same code path).
 *
 * On Render's free tier the filesystem is ephemeral: anything written here
 * is lost on redeploy or restart. To persist uploads, add a Render
 * "Persistent Disk", mount it at e.g. `/var/data/uploads`, and set
 * UPLOAD_DIR=/var/data/uploads — no code changes needed. For a fully
 * durable setup regardless of host, swap this file's body for a real
 * Supabase Storage / Cloudflare R2 upload; call sites only need the
 * returned URL string.
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_ATTACHMENT_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function uploadDir() {
  return UPLOAD_DIR;
}

export async function saveUpload(
  file: File,
  kind: "image" | "attachment"
): Promise<{ url: string } | { error: string }> {
  if (file.size === 0) return { error: "Empty file." };
  if (file.size > MAX_BYTES) return { error: "File is too large (max 5MB)." };

  const allowed = kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_ATTACHMENT_TYPES;
  if (!allowed.includes(file.type)) {
    return {
      error:
        kind === "image"
          ? "Please upload a PNG, JPEG, WEBP, or GIF image."
          : "Please upload a PNG, JPEG, WEBP, GIF, or PDF file.",
    };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || guessExt(file.type);
  const filename = `${newId(kind)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename), buffer);

  return { url: `/uploads/${filename}` };
}

function guessExt(mime: string) {
  return (
    {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
    }[mime] ?? ""
  );
}
