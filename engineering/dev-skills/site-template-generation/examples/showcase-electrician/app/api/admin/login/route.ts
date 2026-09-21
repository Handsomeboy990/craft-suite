import { arrivedOverHttps, createSession, isConfigured, verifyPassword } from '@/lib/auth';
import { callerAddress, consume, reset } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REFUSED = "Identifiants refusés, ou trop de tentatives. Réessayez plus tard.";

export async function POST(request: Request) {
  const address = callerAddress(request.headers);
  const limit = consume('login', address);
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: REFUSED },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let password = '';
  try {
    const payload = (await request.json()) as { password?: unknown };
    password = typeof payload.password === 'string' ? payload.password : '';
  } catch {
    password = '';
  }

  // The same message and the same work for a wrong password, an empty one and
  // an instance whose password was never set.
  const accepted = password.length > 0 && (await verifyPassword(password));
  if (!accepted) {
    return Response.json(
      { ok: false, error: REFUSED, configured: isConfigured() },
      { status: 401 },
    );
  }

  await createSession(address, arrivedOverHttps(request));
  reset('login', address);
  return Response.json({ ok: true });
}
