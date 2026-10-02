import { currentSession } from '@/lib/auth';
import { grantsFor } from '@/lib/matrix';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The signed in user and the matrix row of their role, read only. The client
// renders from it; the server still checks every call.
export async function GET() {
  const { session } = await currentSession();
  if (!session) return Response.json({ ok: false, error: 'session' }, { status: 401 });
  const { account } = session;
  return Response.json({
    ok: true,
    user: { id: account.id, name: account.name, role: account.role },
    grants: grantsFor(account.role),
  });
}
