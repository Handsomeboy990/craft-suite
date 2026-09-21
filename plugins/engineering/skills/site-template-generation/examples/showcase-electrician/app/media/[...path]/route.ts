import { readFileSync } from 'node:fs';
import { contentTypeOf, resolveUpload } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Uploaded media lives in the data directory, not in the bundle, so one backup
// covers the whole instance. The name is resolved and confirmed to sit inside
// that directory: a separator or a traversal in the request reaches nothing.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length !== 1) return new Response('Not found', { status: 404 });

  const resolved = resolveUpload(path[0]!);
  if (!resolved) return new Response('Not found', { status: 404 });

  const bytes = readFileSync(resolved);
  return new Response(new Uint8Array(bytes), {
    headers: {
      // The server decides the type. Nothing is inferred from the request.
      'Content-Type': contentTypeOf(path[0]!),
      'Content-Length': String(bytes.byteLength),
      // The name is generated and never reused, so a long cache is safe.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
