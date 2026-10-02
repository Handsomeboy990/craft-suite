import { record } from 'site-template-shared/lib/audit';
import { HttpError, destroySession, requireSession } from 'site-template-shared/lib/auth';
import { callerAddress } from 'site-template-shared/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ ok: false }, { status: error.status });
    throw error;
  }
  await destroySession();
  record('sign-out', callerAddress(request.headers));
  return Response.json({ ok: true });
}
