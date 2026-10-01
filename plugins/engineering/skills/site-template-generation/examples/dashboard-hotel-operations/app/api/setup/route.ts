import { audit } from '@/lib/audit';
import { callerAddress, consume } from '@/lib/rate-limit';
import { useSetupToken } from '@/lib/setup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The owner of a new account sets its first password through the single use
// link the manager handed over.
export async function POST(request: Request) {
  const address = callerAddress(request.headers);
  if (!consume('setup', address).allowed) return Response.json({ ok: false, error: 'limited' }, { status: 429 });
  const payload = (await request.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const result = await useSetupToken(String(payload.token ?? ''), String(payload.password ?? ''));
  if (result === 'short') return Response.json({ ok: false, error: 'short', field: 'password' }, { status: 422 });
  if (result === 'invalid') {
    audit({ action: 'setup', outcome: 'refused', status: 400, address });
    return Response.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
  audit({ action: 'setup', outcome: 'allowed', status: 200, address });
  return Response.json({ ok: true });
}
