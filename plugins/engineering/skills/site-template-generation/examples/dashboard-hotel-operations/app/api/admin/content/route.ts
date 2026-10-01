import { audit } from '@/lib/audit';
import { HttpError, authorizeApi, failure } from '@/lib/authz';
import { PatchError, applyPatch, saveConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'settings', 'view');
    return Response.json({ ok: true, content: ctx.config });
  } catch (error) {
    return failure(error);
  }
}

// Validated against the field map, snapshotted, written atomically. A refused
// write names the field and changes nothing.
export async function PUT(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'settings', 'update');
    let patch: Record<string, unknown>;
    try {
      const payload = (await request.json()) as { patch?: unknown };
      if (!payload.patch || typeof payload.patch !== 'object' || Array.isArray(payload.patch)) throw new Error('patch');
      patch = payload.patch as Record<string, unknown>;
    } catch {
      throw new HttpError(400, 'badRequest');
    }
    try {
      saveConfig(applyPatch(ctx.config, patch));
    } catch (error) {
      if (error instanceof PatchError) {
        audit({ accountId: ctx.account.id, role: ctx.role, action: 'settings.update', module: 'settings', record: error.field, outcome: 'refused', status: 422, address: ctx.address });
        throw new HttpError(422, error.message, error.field);
      }
      throw error;
    }
    audit({ accountId: ctx.account.id, role: ctx.role, action: 'settings.update', module: 'settings', record: Object.keys(patch).length, outcome: 'allowed', status: 200, address: ctx.address });
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
