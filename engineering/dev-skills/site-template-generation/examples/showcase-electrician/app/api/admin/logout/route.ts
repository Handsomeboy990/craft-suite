import { HttpError, destroySession, requireSession } from '@/lib/auth';

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
  return Response.json({ ok: true });
}
