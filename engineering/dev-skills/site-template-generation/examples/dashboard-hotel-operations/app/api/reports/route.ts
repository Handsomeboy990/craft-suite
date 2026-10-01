import { authorizeApi, failure } from '@/lib/authz';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await authorizeApi(request, 'reports', 'view');
    return Response.json({ ok: true, items: [{ key: 'rate', href: '/reports/rate?period=month' }], total: 1 });
  } catch (error) {
    return failure(error);
  }
}
