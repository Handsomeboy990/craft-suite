import { revalidatePath } from 'next/cache';
import { record } from '@/lib/audit';
import { HttpError, refuseOversizedBody, requireSession } from '@/lib/auth';
import { ContentError, saveContent } from '@/lib/content';
import { list, read } from '@/lib/history';
import { callerAddress } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const oversized = refuseOversizedBody(request);
  if (oversized) return oversized;

  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  const payload = (await request.json()) as { id?: unknown };
  const id = typeof payload.id === 'string' ? payload.id : '';
  const version = read(id);
  if (!version) {
    return Response.json({ ok: false, error: 'Cette version n’existe plus.' }, { status: 404 });
  }

  try {
    // Restoring keeps the state it replaced, so a revert is itself undoable.
    saveContent(version, 'revert');
  } catch (error) {
    if (error instanceof ContentError) {
      return Response.json({ ok: false, error: error.message }, { status: 422 });
    }
    throw error;
  }

  record('content-revert', callerAddress(request.headers), id);
  revalidatePath('/', 'layout');
  return Response.json({ ok: true, versions: list().length });
}
