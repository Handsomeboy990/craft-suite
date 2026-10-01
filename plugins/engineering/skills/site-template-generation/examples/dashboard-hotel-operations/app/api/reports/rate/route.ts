import { authorizeApi, failure } from '@/lib/authz';
import { rateReport } from '@/lib/kpis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The drill down of averageRate: the nights sold and the room revenue of each
// day of the month so far, and the average they give.
export async function GET(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'reports', 'view');
    return Response.json({ ok: true, period: 'month', ...rateReport(ctx) });
  } catch (error) {
    return failure(error);
  }
}
