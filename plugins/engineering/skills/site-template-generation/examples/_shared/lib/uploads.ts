import { randomBytes } from 'node:crypto';
import { readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { UPLOAD_DIR, ensureDataDir } from './paths';

// An allow list, checked twice: by the declared type and by the file's own
// leading bytes. SVG is refused: it is a document that can carry script.
const TYPES = [
  { mime: 'image/jpeg', extension: 'jpg', magic: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', extension: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', extension: 'webp', magic: [0x52, 0x49, 0x46, 0x46] },
  { mime: 'image/avif', extension: 'avif', magic: null },
  { mime: 'image/heic', extension: 'heic', magic: null },
  { mime: 'image/heif', extension: 'heif', magic: null },
] as const;

// What a client can send, and what the site will serve. The gap between the two
// is the point: a photograph taken on a telephone is eight megapixels and four
// megabytes, and nobody who is not a developer is going to resize it first.
export const MAX_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 2000;
const QUALITY = 82;

export type UploadResult = {
  src: string;
  name: string;
  bytes: number;
  /** What arrived, so the back office can show what it saved. */
  originalBytes: number;
  width: number;
  height: number;
};

export class UploadError extends Error {}

function typeOf(mime: string) {
  return TYPES.find((type) => type.mime === mime) ?? null;
}

function magicMatches(type: (typeof TYPES)[number], bytes: Uint8Array): boolean {
  if (!type.magic) return true;
  return type.magic.every((byte, index) => bytes[index] === byte);
}

export async function storeUpload(file: File): Promise<UploadResult> {
  const type = typeOf(file.type);
  if (!type) throw new UploadError('unsupported file type');
  // The cap is checked before the file is read whole.
  if (file.size > MAX_BYTES) throw new UploadError('file too large');

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) throw new UploadError('file too large');
  if (!magicMatches(type, bytes)) throw new UploadError('file content does not match its type');

  ensureDataDir();

  // Resized, re-encoded and stripped of its metadata. Stripping is not a
  // nicety: a photograph carries the place and the time it was taken, and a
  // client uploading a picture of a job does not mean to publish a customer's
  // address.
  const image = sharp(bytes, { failOn: 'error' }).rotate();
  const meta = await image.metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const icon = (meta.width ?? 0) <= 512 && (meta.height ?? 0) <= 512;

  const pipeline = longEdge > MAX_EDGE ? image.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' }) : image;
  // An icon keeps its transparency and its format; a photograph becomes webp,
  // which is a third of the bytes for the same picture.
  const output = icon ? await pipeline.png().toBuffer({ resolveWithObject: true })
                      : await pipeline.webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });

  const extension = icon ? 'png' : 'webp';
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${extension}`;
  writeFileSync(join(UPLOAD_DIR, name), output.data, { mode: 0o600 });

  return {
    src: `/media/${name}`,
    name,
    bytes: output.data.byteLength,
    originalBytes: bytes.byteLength,
    width: output.info.width,
    height: output.info.height,
  };
}

export function listUploads(): { src: string; name: string; bytes: number; modifiedAt: string }[] {
  ensureDataDir();
  return readdirSync(UPLOAD_DIR)
    .filter((name) => !name.startsWith('.'))
    .map((name) => {
      const stat = statSync(join(UPLOAD_DIR, name));
      return {
        src: `/media/${name}`,
        name,
        bytes: stat.size,
        modifiedAt: new Date(stat.mtimeMs).toISOString(),
      };
    })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

// Any path derived from a request is resolved and confirmed to sit inside the
// directory it belongs to. A name containing a separator or a traversal never
// escapes the uploads directory.
export function resolveUpload(name: string): string | null {
  if (name.includes('/') || name.includes('\\') || name.startsWith('.')) return null;
  const path = resolve(join(UPLOAD_DIR, name));
  if (!path.startsWith(resolve(UPLOAD_DIR))) return null;
  try {
    statSync(path);
  } catch {
    return null;
  }
  return path;
}

export function deleteUpload(name: string): boolean {
  const path = resolveUpload(name);
  if (!path) return false;
  unlinkSync(path);
  return true;
}

export function contentTypeOf(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase();
  const type = TYPES.find((candidate) => candidate.extension === extension);
  return type ? type.mime : 'application/octet-stream';
}
