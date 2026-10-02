import { audit } from '@/lib/audit';
import { csrfMatches, currentSession, destroySession } from '@/lib/auth';
import { callerAddress } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Signing out deletes the server record, then the cookie.
export async function POST(request: Request) {
  const { session } = await currentSession();
  if (!session) return Response.json({ ok: false, error: 'session' }, { status: 401 });
  if (!csrfMatches(request.headers.get('x-csrf-token'), session.csrf)) {
    return Response.json({ ok: false, error: 'csrf' }, { status: 403 });
  }
  await destroySession();
  audit({
    accountId: session.account.id,
    role: session.account.role,
    action: 'signOut',
    outcome: 'allowed',
    status: 200,
    address: callerAddress(request.headers),
  });
  return Response.json({ ok: true });
}
