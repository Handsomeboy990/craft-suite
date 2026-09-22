import { HttpError, changePassword, requireSession , refuseOversizedBody } from '@/lib/auth';
import { record } from '@/lib/audit';
import { callerAddress, consume } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

  // The same limit as the login: guessing the current password from inside a
  // stolen session is the same attack from a shorter distance.
  const limit = consume('login', callerAddress(request.headers));
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let current = '';
  let next = '';
  try {
    const payload = (await request.json()) as { current?: unknown; next?: unknown };
    current = typeof payload.current === 'string' ? payload.current : '';
    next = typeof payload.next === 'string' ? payload.next : '';
  } catch {
    return Response.json({ ok: false, error: 'requête invalide' }, { status: 400 });
  }

  const outcome = await changePassword(current, next);
  if (outcome === 'short') {
    return Response.json(
      { ok: false, error: 'Le nouveau mot de passe doit faire au moins 12 caractères.' },
      { status: 422 },
    );
  }
  if (outcome === 'wrong') {
    return Response.json({ ok: false, error: 'Mot de passe actuel incorrect.' }, { status: 401 });
  }

  record('password-change', callerAddress(request.headers));
  return Response.json({ ok: true });
}
