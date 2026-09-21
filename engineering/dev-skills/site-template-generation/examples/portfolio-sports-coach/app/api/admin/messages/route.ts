import { HttpError, requireSession } from '@/lib/auth';
import { removeMessage, setStatus } from '@/lib/messages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard(request: Request): Promise<Response | null> {
  try {
    await requireSession(request);
    return null;
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  const refused = await guard(request);
  if (refused) return refused;

  const payload = (await request.json()) as { id?: unknown; status?: unknown };
  const id = typeof payload.id === 'string' ? payload.id : '';
  const status = payload.status;
  if (status !== 'unread' && status !== 'read' && status !== 'archived') {
    return Response.json({ ok: false, error: 'statut inconnu' }, { status: 422 });
  }
  return Response.json({ ok: setStatus(id, status) });
}

export async function DELETE(request: Request) {
  const refused = await guard(request);
  if (refused) return refused;

  const id = new URL(request.url).searchParams.get('id') ?? '';
  return Response.json({ ok: removeMessage(id) });
}
