import { readFileSync } from 'node:fs';
import { revalidatePath } from 'next/cache';
import { HttpError, requireSession } from '@/lib/auth';
import { ContentError, saveContent } from '@/lib/content';
import { FILES } from '@/lib/paths';
import { callerAddress, consume } from '@/lib/rate-limit';
import { PatchError, applyPatch } from '@/lib/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The client's own copy of their site. A GET carries no state change, so it
// needs the session and not the token.
export async function GET(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  const current = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  return Response.json(
    { ok: true, content: current },
    { headers: { 'Content-Disposition': 'inline; filename="content.json"' } },
  );
}

// Every write is validated against the contract before it touches the file, and
// the file is replaced atomically. A rejected write names the field and changes
// nothing.
export async function PUT(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  const limit = consume('write', callerAddress(request.headers));
  if (!limit.allowed) {
    return Response.json({ ok: false, error: 'trop de requêtes' }, { status: 429 });
  }

  let patch: Record<string, unknown>;
  try {
    const payload = (await request.json()) as { patch?: unknown };
    if (payload.patch === null || typeof payload.patch !== 'object') throw new Error('bad payload');
    patch = payload.patch as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'requête invalide' }, { status: 400 });
  }

  try {
    const current = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
    saveContent(applyPatch(current, patch));
  } catch (error) {
    if (error instanceof PatchError || error instanceof ContentError) {
      return Response.json({ ok: false, error: error.message }, { status: 422 });
    }
    throw error;
  }

  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
