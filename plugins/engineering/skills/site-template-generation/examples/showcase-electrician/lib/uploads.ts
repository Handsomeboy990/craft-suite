import { randomBytes } from 'node:crypto';
import { readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UPLOAD_DIR, ensureDataDir } from './paths';

// An allow list, checked twice: by the declared type and by the file's own
// leading bytes. SVG is refused: it is a document that can carry script.
const TYPES = [
  { mime: 'image/jpeg', extension: 'jpg', magic: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', extension: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', extension: 'webp', magic: [0x52, 0x49, 0x46, 0x46] },
  { mime: 'image/avif', extension: 'avif', magic: null },
] as const;

export const MAX_BYTES = 4 * 1024 * 1024;

export type UploadResult = { src: string; name: string; bytes: number };

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
  // The name is generated. Nothing from the upload reaches the filesystem.
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${type.extension}`;
  writeFileSync(join(UPLOAD_DIR, name), bytes, { mode: 0o600 });
  return { src: `/media/${name}`, name, bytes: bytes.byteLength };
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
