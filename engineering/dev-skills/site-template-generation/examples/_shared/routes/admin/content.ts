import { readFileSync } from 'node:fs';
import { revalidatePath } from 'next/cache';
import { HttpError, requireSession, refuseOversizedBody } from '../../lib/auth';
import { FILES } from '../../lib/paths';
import { callerAddress, consume } from '../../lib/rate-limit';
import { record } from '../../lib/audit';
import type { InstanceContent, SiteInstance } from '../../lib/instance';

// GET and PUT /api/admin/content, for the instance whose loader, writer and
// allow list are passed in.
export function contentRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  // The client's own copy of their site. A GET carries no state change, so it
  // needs the session and not the token.
  async function GET(request: Request) {
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
  async function PUT(request: Request) {
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
      instance.saveContent(instance.applyPatch(current, patch));
    } catch (error) {
      if (instance.isPatchError(error) || instance.isContentError(error)) {
        return Response.json({ ok: false, error: error.message }, { status: 422 });
      }
      throw error;
    }

    record('content-write', callerAddress(request.headers), Object.keys(patch).join(', '));
    revalidatePath('/', 'layout');
    return Response.json({ ok: true });
  }

  return { GET, PUT };
}
