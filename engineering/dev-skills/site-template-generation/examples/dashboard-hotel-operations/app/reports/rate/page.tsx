import Link from 'next/link';
import { requirePage } from '@/lib/authz';
import { fill } from '@/lib/config';
import { date, money, number, time } from '@/lib/format';
import { rateReport } from '@/lib/kpis';
import { can } from '@/lib/matrix';
import { PageHeader } from '@/components/parts';

export const dynamic = 'force-dynamic';

// The drill down of the average rate: every night of the month so far, the
// rooms sold and their revenue, and the average they give. The figure on the
// overview is this page's last line.
export default async function RateReportPage() {
  const ctx = await requirePage('reports');
  const { config } = ctx;
  const strings = config.modules.reports;
  const report = rateReport(ctx);
  const loadedAt = time(config, new Date().toISOString());
  return (
    <>
      <nav aria-label={config.ui.shell!.breadcrumbLabel} className="breadcrumb">
        <ol>
          <li>
            <Link href="/reports">{fill(config.ui.shell!.backToList!, { module: strings.label })}</Link>
          </li>
          <li aria-current="page">{config.ui.reports!.rateTitle}</li>
        </ol>
      </nav>
      <PageHeader
        title={config.ui.reports!.rateTitle!}
        intro={config.ui.reports!.rateIntro}
        stamp={{ text: fill(config.ui.states!.loadedAt!, { time: loadedAt }), time: loadedAt }}
        action={
          can(ctx.role, 'reports', 'export') ? (
            <a className="button" href="/api/reports/export?report=rate&period=month">
              {config.ui.table!.export}
            </a>
          ) : null
        }
      />
      <p role="status" className="result-count" data-average={report.average}>
        {fill(config.ui.reports!.rateResult!, {
          average: money(config, report.average),
          nights: number(config, report.nights),
          revenue: money(config, report.revenue),
        })}
      </p>
      <div className="table-wrap" role="region" aria-labelledby="rate-caption" tabIndex={0}>
        <table className="table">
          <caption id="rate-caption">{strings.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{strings.columns.date}</th>
              <th scope="col" className="col--number">
                {strings.columns.nights}
              </th>
              <th scope="col" className="col--money">
                {strings.columns.revenue}
              </th>
            </tr>
          </thead>
          <tbody>
            {report.days.map((day) => (
              <tr key={day.date}>
                <th scope="row">{date(config, day.date)}</th>
                <td className="col--number">{number(config, day.nights)}</td>
                <td className="col--money">{money(config, day.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
