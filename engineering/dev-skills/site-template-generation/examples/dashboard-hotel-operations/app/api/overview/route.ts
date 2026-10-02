import { authorizeApi, failure } from '@/lib/authz';
import { computeKpis, distribution, trend } from '@/lib/kpis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The figures, the trend and the distribution are computed independently: one
// failing leaves the others in the answer, with its own error.
function attempt<T>(work: () => T): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: work() };
  } catch (error) {
    console.error('overview widget failed', error instanceof Error ? error.message : error);
    return { ok: false, error: 'failed' };
  }
}

export async function GET(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'overview', 'view');
    const kpis = attempt(() => computeKpis(ctx));
    return Response.json({
      ok: true,
      kpis: kpis.ok ? kpis.data.kpis : null,
      cached: kpis.ok ? kpis.data.cached : false,
      errors: { kpis: kpis.ok ? null : kpis.error },
      charts: {
        trend: attempt(() => trend(ctx)),
        distribution: attempt(() => distribution(ctx)),
      },
    });
  } catch (error) {
    return failure(error);
  }
}
