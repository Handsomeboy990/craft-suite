import Link from 'next/link';
import { requirePage, type Ctx } from '@/lib/authz';
import { fill } from '@/lib/config';
import { time } from '@/lib/format';
import { computeKpis, distribution, trend, type Kpi } from '@/lib/kpis';
import { runList, type ModuleDef } from '@/lib/list';
import { MODULES, can } from '@/lib/matrix';
import { definition } from '@/lib/modules';
import { ActionButton, RetryButton } from '@/components/client/list';
import { DistributionChart, TrendChart } from '@/components/Charts';
import { actionFields } from '@/components/ListView';
import { PageHeader, StatePanel, StatusIcon } from '@/components/parts';

export const dynamic = 'force-dynamic';

// Each widget is computed on its own: one failing leaves the others in place,
// with its own error and its own retry.
function attempt<T>(work: () => T): { ok: true; value: T } | { ok: false } {
  try {
    return { ok: true, value: work() };
  } catch (error) {
    console.error('overview widget failed', error instanceof Error ? error.message : error);
    return { ok: false };
  }
}

function KpiCard({ kpi, ctx }: { kpi: Kpi; ctx: Ctx }) {
  const tone = kpi.status === 'ok' ? 'neutral' : kpi.status;
  return (
    <article className={`kpi kpi--${tone}`} data-kpi={kpi.key} aria-labelledby={`kpi-${kpi.key}`}>
      <h2 id={`kpi-${kpi.key}`} className="kpi__label">
        {kpi.label}
      </h2>
      <p className="kpi__period">{kpi.period}</p>
      <p className="kpi__value">
        <Link href={kpi.drill} aria-label={fill(ctx.config.ui.overview!.open!, { label: kpi.label, value: kpi.display })}>
          {kpi.display}
        </Link>
      </p>
      <p className="kpi__detail">{kpi.detail}</p>
      {kpi.status !== 'ok' ? (
        <p className={`kpi__status badge badge--${tone}`} data-status={kpi.status}>
          <StatusIcon tone={tone} />
          {kpi.statusWord}
        </p>
      ) : null}
      <p className="kpi__asof">
        <time dateTime={kpi.asOf}>{fill(ctx.config.ui.overview!.asOf!, { time: time(ctx.config, kpi.asOf) })}</time>
      </p>
    </article>
  );
}

function AttentionList({
  ctx,
  def,
  title,
  search,
  actionKeys,
  link,
}: {
  ctx: Ctx;
  def: ModuleDef;
  title: string;
  search: string;
  actionKeys: string[];
  link?: (row: Record<string, unknown>) => { href: string; label: string };
}) {
  const strings = ctx.config.modules[def.key];
  const base = MODULES[def.key].route;
  const listed = attempt(() => {
    const params = new URLSearchParams(search);
    const filters: Record<string, string> = {};
    params.forEach((value, key) => (filters[key] = value));
    return runList(def, ctx, { page: 1, pageSize: 5, sortKey: def.defaultSort.split('.')[0]!, sortDir: 'asc', filters, defaulted: [] });
  });
  return (
    <section className="attention" aria-labelledby={`attention-${def.key}-${title.length}`}>
      <h3 id={`attention-${def.key}-${title.length}`}>{title}</h3>
      {!listed.ok ? (
        <StatePanel tone="danger" title={strings.error} role="alert">
          <RetryButton />
        </StatePanel>
      ) : listed.value.total === 0 ? (
        <p className="muted">{ctx.config.ui.overview!.nothing}</p>
      ) : (
        <ul className="attention__list">
          {listed.value.items.map((row) => {
            const labels = def.label(row);
            const actions = (row.actions as unknown as string[]) ?? [];
            const extra = link?.(row);
            return (
              <li key={String(row.id)}>
                <Link href={`${base}/${row.id}`}>{strings.open ? fill(strings.open, labels) : String(row.id)}</Link>
                <span className="row-actions">
                  {def.actions
                    .filter((action) => actionKeys.includes(action.key) && actions.includes(action.key))
                    .map((action) => {
                      const words = strings.actions![action.key]!;
                      return (
                        <ActionButton
                          key={action.key}
                          url={`/api/${def.key}/${row.id}/${action.key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`}
                          label={words.label}
                          name={fill(words.named ?? words.label, labels)}
                          confirm={words.confirm ? fill(words.confirm, labels) : undefined}
                          keep={words.keep}
                          done={fill(words.done, labels)}
                          fields={actionFields(ctx.config, def.key, action.fields)}
                          primary
                        />
                      );
                    })}
                  {extra ? (
                    <Link className="button" href={extra.href}>
                      {extra.label}
                    </Link>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {listed.ok && listed.value.total > 0 ? (
        <p>
          <Link href={`${base}?${search}`}>{fill(ctx.config.ui.overview!.viewAll!, { n: listed.value.total, module: strings.label })}</Link>
        </p>
      ) : null}
    </section>
  );
}

export default async function OverviewPage() {
  const ctx = await requirePage('overview');
  const { config } = ctx;
  const kpis = attempt(() => computeKpis(ctx).kpis);
  const trendResult = attempt(() => trend(ctx));
  const distributionResult = attempt(() => distribution(ctx));
  const stays = definition('stays')!;
  const tasks = definition('tasks')!;
  const items = definition('items')!;
  const loadedAt = time(config, new Date().toISOString());
  const attention = [
    can(ctx.role, 'stays', 'checkIn') ? (
      <AttentionList key="arrivals" ctx={ctx} def={stays} title={config.ui.overview!.arrivals!} search="arrival=today&status=confirmed" actionKeys={['checkIn']} />
    ) : null,
    can(ctx.role, 'stays', 'checkOut') ? (
      <AttentionList key="departures" ctx={ctx} def={stays} title={config.ui.overview!.departures!} search="departure=today&status=inHouse" actionKeys={['checkOut']} />
    ) : null,
    can(ctx.role, 'tasks', 'start') ? (
      <AttentionList key="tasks" ctx={ctx} def={tasks} title={config.ui.overview!.tasks!} search="date=today" actionKeys={['start', 'finish']} />
    ) : null,
    can(ctx.role, 'movements', 'create') ? (
      <AttentionList
        key="items"
        ctx={ctx}
        def={items}
        title={config.ui.overview!.reorderTitle!}
        search="level=low"
        actionKeys={[]}
        link={(row) => ({
          href: `/stock/movements/new?itemId=${row.id}&kind=in`,
          label: fill(config.ui.overview!.reorder!, { item: String(row.name) }),
        })}
      />
    ) : null,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title={config.ui.overview!.title!}
        intro={config.ui.overview!.intro}
        stamp={{ text: fill(config.ui.states!.loadedAt!, { time: loadedAt }), time: loadedAt }}
      />
      <section aria-labelledby="figures-title">
        <h2 id="figures-title" className="visually-hidden">
          {config.ui.overview!.figures}
        </h2>
        {kpis.ok ? (
          <div className="kpis">
            {kpis.value.map((kpi) => (
              <KpiCard key={kpi.key} kpi={kpi} ctx={ctx} />
            ))}
          </div>
        ) : (
          <StatePanel tone="danger" title={config.ui.states!.widgetError!} role="alert">
            <RetryButton />
          </StatePanel>
        )}
      </section>
      <div className="charts">
        {!trendResult.ok ? (
          <StatePanel tone="danger" title={config.ui.states!.widgetError!} role="alert">
            <RetryButton />
          </StatePanel>
        ) : trendResult.value ? (
          <TrendChart config={config} trend={trendResult.value} />
        ) : null}
        {!distributionResult.ok ? (
          <StatePanel tone="danger" title={config.ui.states!.widgetError!} role="alert">
            <RetryButton />
          </StatePanel>
        ) : distributionResult.value ? (
          <DistributionChart config={config} data={distributionResult.value} />
        ) : null}
      </div>
      {attention.length ? (
        <section className="panel" aria-labelledby="attention-title">
          <h2 id="attention-title">{config.ui.overview!.attention}</h2>
          <div className="attention-grid">{attention}</div>
        </section>
      ) : null}
    </>
  );
}
