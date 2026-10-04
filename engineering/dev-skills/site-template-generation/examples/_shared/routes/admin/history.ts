import { revalidatePath } from 'next/cache';
import { record } from '../../lib/audit';
import { HttpError, refuseOversizedBody, requireSession } from '../../lib/auth';
import { list, read } from '../../lib/history';
import type { InstanceContent, SiteInstance } from '../../lib/site-instance';
import { callerAddress } from '../../lib/rate-limit';

// POST /api/admin/history: put the site back to a saved version, through the
// instance's own writer so the version is validated like any other write.
export function historyRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  async function POST(request: Request) {
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
      instance.saveContent(version, 'revert');
    } catch (error) {
      if (instance.isContentError(error)) {
        return Response.json({ ok: false, error: error.message }, { status: 422 });
      }
      throw error;
    }

    record('content-revert', callerAddress(request.headers), id);
    revalidatePath('/', 'layout');
    return Response.json({ ok: true, versions: list().length });
  }

  return { POST };
}
