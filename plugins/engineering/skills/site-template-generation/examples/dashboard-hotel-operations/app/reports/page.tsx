import Link from 'next/link';
import { requirePage } from '@/lib/authz';
import { PageHeader } from '@/components/parts';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const ctx = await requirePage('reports');
  const strings = ctx.config.modules.reports;
  return (
    <>
      <PageHeader title={strings.title} intro={strings.intro} />
      <section className="panel">
        <ul className="report-list">
          <li>
            <Link href="/reports/rate?period=month">{ctx.config.ui.reports!.rateTitle}</Link>
            <p className="muted">{ctx.config.ui.reports!.rateIntro}</p>
          </li>
        </ul>
      </section>
    </>
  );
}
