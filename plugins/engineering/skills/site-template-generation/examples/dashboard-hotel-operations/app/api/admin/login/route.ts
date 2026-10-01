import { audit } from '@/lib/audit';
import { arrivedOverHttps, checkCredentials, createSession } from '@/lib/auth';
import { callerAddress, clear, consume } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Limited per address and per identifier. A wrong password, an unknown account
// and a deactivated one get the same answer after the same work.
export async function POST(request: Request) {
  const address = callerAddress(request.headers);
  let identifier = '';
  let password = '';
  try {
    const text = await request.text();
    if (text.length > 4096) return Response.json({ ok: false, error: 'tooLarge' }, { status: 413 });
    const payload = JSON.parse(text) as { identifier?: unknown; password?: unknown };
    identifier = typeof payload.identifier === 'string' ? payload.identifier.trim().toLowerCase().slice(0, 160) : '';
    password = typeof payload.password === 'string' ? payload.password.slice(0, 200) : '';
  } catch {
    // An unreadable body is a refused sign in like any other.
  }

  const byAddress = consume('login', `address:${address}`);
  const byAccount = consume('login', `account:${identifier}`);
  if (!byAddress.allowed || !byAccount.allowed) {
    audit({ action: 'signIn.limited', outcome: 'refused', status: 429, address });
    const retry = Math.max(byAddress.retryAfterSeconds, byAccount.retryAfterSeconds);
    return Response.json({ ok: false, error: 'limited' }, { status: 429, headers: { 'Retry-After': String(retry) } });
  }

  const account = identifier && password ? await checkCredentials(identifier, password) : null;
  if (!account) {
    audit({ action: 'signIn', outcome: 'refused', status: 401, address });
    return Response.json({ ok: false, error: 'credentials' }, { status: 401 });
  }

  await createSession(account, address, arrivedOverHttps(request));
  clear('login', `address:${address}`);
  clear('login', `account:${identifier}`);
  audit({ accountId: account.id, role: account.role, action: 'signIn', outcome: 'allowed', status: 200, address });
  return Response.json({ ok: true });
}
