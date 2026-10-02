import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HttpError, type Ctx } from '@/lib/authz';
import { fill } from '@/lib/config';
import { all, type Row } from '@/lib/db';
import { dateTime, time } from '@/lib/format';
import { findRecord, type Column, type ModuleDef } from '@/lib/list';
import { MODULES, can } from '@/lib/matrix';
import { ActionButton } from './client/list';
import { Cell } from './cells';
import { actionFields } from './ListView';
import { PageHeader } from './parts';

// Extra detail fields that are not list columns, with their type.
const EXTRA: Record<string, Pick<Column, 'type' | 'set'>> = {
  rate: { type: 'money' },
  paid: { type: 'money' },
  adults: { type: 'number' },
  children: { type: 'number' },
  folio_status: { type: 'status', set: 'folios' },
  supplier: { type: 'text' },
  out_of_order_reason: { type: 'text' },
  notes: { type: 'text' },
  unit: { type: 'text' },
  reason: { type: 'text' },
  module: { type: 'text' },
  status: { type: 'number' },
  address: { type: 'text' },
  created_at: { type: 'datetime' },
};

// A record, addressable by URL: its fields, the actions it allows now, its
// history from the audit log, and the way back to the filtered list it came
// from.
export function DetailView({ def, ctx, id, back }: { def: ModuleDef; ctx: Ctx; id: string; back?: string }) {
  const { config } = ctx;
  const strings = config.modules[def.key];
  const base = MODULES[def.key].route;
  let row: Row & { actions?: string[] };
  try {
    row = findRecord(def, ctx, id) as Row & { actions?: string[] };
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
  const labels = def.label(row);
  const backHref = back && (back === base || back.startsWith(`${base}?`)) ? back : base;
  const actions = row.actions ?? [];
  const history = can(ctx.role, 'audit', 'view') || def.key === 'stays'
    ? all(
        `SELECT au.at, au.action, a.name AS account FROM audit au LEFT JOIN accounts a ON a.id = au.account_id
         WHERE au.module = ? AND au.record = ? AND au.outcome = 'allowed' ORDER BY au.id DESC LIMIT 20`,
        [def.key, String(row.id)],
      )
    : [];
  const loadedAt = time(config, new Date().toISOString());
  const title = strings.open ? fill(strings.open, labels) : String(Object.values(labels)[0] ?? row.id);

  return (
    <>
      <nav aria-label={config.ui.shell!.breadcrumbLabel} className="breadcrumb">
        <ol>
          <li>
            <Link href={backHref}>{fill(config.ui.shell!.backToList!, { module: strings.label })}</Link>
          </li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <PageHeader
        title={title}
        stamp={{ text: fill(config.ui.states!.loadedAt!, { time: loadedAt }), time: loadedAt }}
        action={
          actions.includes('edit') ? (
            <Link className="button" href={`${base}/${row.id}/edit`}>
              {config.ui.detail!.edit}
            </Link>
          ) : null
        }
      />
      <section className="panel" aria-labelledby="record-fields">
        <h2 id="record-fields">{config.ui.detail!.fields}</h2>
        <dl className="record">
          {(def.detail ?? []).filter((key) => key in row).map((key) => {
            const column = def.columns.find((candidate) => candidate.key === key) ?? { key, ...(EXTRA[key] ?? { type: 'text' as const }) };
            return (
              <div key={key}>
                <dt>{strings.columns[key] ?? strings.fields?.[key] ?? key}</dt>
                <dd>
                  <Cell config={config} column={column as Column} value={row[key] ?? null} />
                </dd>
              </div>
            );
          })}
        </dl>
        {def.key === 'stays' && row.folio_id ? (
          <p>
            <Link href={`/folios/${row.folio_id}`}>{fill(config.ui.detail!.openFolio!, { folio: String(row.folio) })}</Link>
          </p>
        ) : null}
      </section>
      <section className="panel" aria-labelledby="record-actions">
        <h2 id="record-actions">{config.ui.detail!.actions}</h2>
        <div className="row-actions">
          {def.actions.filter((action) => actions.includes(action.key)).length === 0 ? (
            <p className="muted">{config.ui.detail!.noActions}</p>
          ) : null}
          {def.actions
            .filter((action) => actions.includes(action.key))
            .map((action) => {
              const words = strings.actions?.[action.key];
              if (!words) return null;
              return (
                <ActionButton
                  key={action.key}
                  url={`/api/${def.key}/${row.id}/${action.key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`}
                  label={words.label}
                  name={fill(words.named ?? words.label, labels)}
                  confirm={words.confirm ? fill(words.confirm, labels) : undefined}
                  keep={words.keep}
                  done={fill(words.done, labels)}
                  fields={actionFields(config, def.key, action.fields)}
                />
              );
            })}
        </div>
      </section>
      {history.length || def.key === 'stays' ? (
        <section className="panel" aria-labelledby="record-history">
          <h2 id="record-history">{config.ui.detail!.history}</h2>
          {history.length === 0 ? (
            <p className="muted">{config.ui.detail!.noHistory}</p>
          ) : (
            <ul className="history">
              {history.map((entry, index) => (
                <li key={index}>
                  <time dateTime={String(entry.at)}>{dateTime(config, String(entry.at))}</time> {String(entry.action)}
                  {entry.account ? `, ${String(entry.account)}` : ''}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </>
  );
}
