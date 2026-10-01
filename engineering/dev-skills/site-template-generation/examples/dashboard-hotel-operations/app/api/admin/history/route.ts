import { audit } from '@/lib/audit';
import { HttpError, authorizeApi, failure } from '@/lib/authz';
import { PatchError, restoreSnapshot, snapshots } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await authorizeApi(request, 'settings', 'view');
    return Response.json({ ok: true, snapshots: snapshots() });
  } catch (error) {
    return failure(error);
  }
}

// Any previous configuration back in one action. The present one is
// snapshotted first, so a restore can itself be undone.
export async function POST(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'settings', 'update');
    const payload = (await request.json().catch(() => ({}))) as { snapshot?: unknown };
    try {
      restoreSnapshot(String(payload.snapshot ?? ''));
    } catch (error) {
      if (error instanceof PatchError) throw new HttpError(422, error.message, error.field);
      throw error;
    }
    audit({ accountId: ctx.account.id, role: ctx.role, action: 'settings.restore', module: 'settings', record: String(payload.snapshot).slice(0, 40), outcome: 'allowed', status: 200, address: ctx.address });
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
