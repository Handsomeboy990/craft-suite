import { audit } from '@/lib/audit';
import { authorizeApi, failure } from '@/lib/authz';
import { rateReport } from '@/lib/kpis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'reports', 'export');
    const report = rateReport(ctx);
    const labels = ctx.config.modules.reports.columns;
    const lines = [[labels.date, labels.nights, labels.revenue].join(',')];
    for (const day of report.days) lines.push([day.date, day.nights, (day.revenue / 100).toFixed(2)].join(','));
    audit({ accountId: ctx.account.id, role: ctx.role, action: 'reports.export', module: 'reports', record: 'rate', outcome: 'allowed', status: 200, address: ctx.address });
    return new Response(`${lines.join('\n')}\n`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rate-${ctx.today}.csv"`,
      },
    });
  } catch (error) {
    return failure(error);
  }
}
