import { HttpError, requireSession } from '@/lib/auth';
import { addSubscription, listSubscriptions, pushPublicKey, removeSubscription } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ ok: false }, { status: error.status });
    throw error;
  }
  return Response.json({
    ok: true,
    publicKey: pushPublicKey(),
    subscriptions: listSubscriptions().length,
  });
}

export async function POST(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ ok: false }, { status: error.status });
    throw error;
  }

  const payload = (await request.json()) as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  const endpoint = typeof payload.endpoint === 'string' ? payload.endpoint : '';
  const p256dh = typeof payload.keys?.p256dh === 'string' ? payload.keys.p256dh : '';
  const auth = typeof payload.keys?.auth === 'string' ? payload.keys.auth : '';
  if (!endpoint.startsWith('https://') || !p256dh || !auth) {
    return Response.json({ ok: false, error: 'abonnement invalide' }, { status: 422 });
  }

  addSubscription({ endpoint, keys: { p256dh, auth } });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ ok: false }, { status: error.status });
    throw error;
  }
  const endpoint = new URL(request.url).searchParams.get('endpoint') ?? '';
  removeSubscription(endpoint);
  return Response.json({ ok: true });
}
