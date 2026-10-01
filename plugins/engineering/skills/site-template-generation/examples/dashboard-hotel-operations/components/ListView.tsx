import Link from 'next/link';
import type { Ctx } from '@/lib/authz';
import { fill } from '@/lib/config';
import { date, number, time } from '@/lib/format';
import { delayIf, failIf } from '@/lib/faults';
import { readQuery, runList, type Filter, type ListResult, type ModuleDef } from '@/lib/list';
import { MODULES, can } from '@/lib/matrix';
import { OPTIONS } from '@/lib/modules';
import type { Config } from '@/lib/types';
import type { FieldDef } from '@/lib/validate';
import { ActionButton, FilterForm, RetryButton, SearchField, SortButton, type ActionField } from './client/list';
import { Cell } from './cells';
import { PageHeader, StatePanel } from './parts';

type Search = Record<string, string | string[] | undefined>;

export function toParams(search: Search): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) params.set(key, value[0]);
  }
  return params;
}

function href(base: string, params: URLSearchParams, changes: Record<string, string | null>): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return query ? `${base}?${query}` : base;
}

function optionWords(config: Config, set: string | undefined): Record<string, string> {
  if (!set) return {};
  return config.statuses[set] ?? config.options[set] ?? config.roles ?? {};
}

function valueLabel(config: Config, filter: Filter, value: string): string {
  if (value === 'today') return config.ui.filters!.today!;
  if (filter.kind === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return date(config, value);
  if (filter.kind === 'select') {
    const words = filter.set === 'roles' ? (config.roles as Record<string, string>) : optionWords(config, filter.set);
    return words[value] ?? value;
  }
  return value;
}

// The fields of a row action, with their words and options.
export function actionFields(config: Config, module: string, fields: FieldDef[] | undefined): ActionField[] | undefined {
  if (!fields) return undefined;
  const labels = config.modules[module as keyof Config['modules']].fields ?? {};
  return fields.map((field) => {
    const set = field.options === OPTIONS.methods ? 'methods' : field.options === OPTIONS.roles ? 'roles' : undefined;
    const words: Record<string, string> =
      set === 'roles' ? (config.roles as Record<string, string>) : set ? config.options[set] ?? {} : {};
    return {
      key: field.key,
      label: labels[field.key] ?? field.key,
      kind: field.kind === 'money' ? 'money' : field.kind === 'select' ? 'select' : field.kind === 'boolean' ? 'boolean' : 'text',
      required: field.required,
      options: field.options?.map((value) => ({ value, label: words[value] ?? value })),
    };
  });
}

export async function ListView({ def, ctx, search }: { def: ModuleDef; ctx: Ctx; search: Search }) {
  const { config } = ctx;
  const strings = config.modules[def.key];
  const base = MODULES[def.key].route;
  const params = toParams(search);
  const query = readQuery(def, params);
  const current = params.toString();
  const listUrl = current ? `${base}?${current}` : base;
  const loadedAt = time(config, new Date().toISOString());

  let result: ListResult | null = null;
  let firstUse = false;
  try {
    failIf(`list.${def.key}`);
    await delayIf(`delay.${def.key}`);
    result = runList(def, ctx, query);
    if (result.total === 0) {
      firstUse = runList(def, ctx, { ...query, filters: { ...Object.fromEntries(Object.keys(query.filters).map((key) => [key, 'any'])) } }).total === 0;
    }
  } catch (error) {
    console.error(`list ${def.key} failed`, error instanceof Error ? error.message : error);
    result = null;
  }

  const canCreate = Boolean(def.create) && can(ctx.role, def.key, 'create');
  const canExport = can(ctx.role, def.key, 'export');
  const visibleFilters = def.filters.filter((filter) => !filter.hidden && filter.kind !== 'search');
  const search_ = def.filters.find((filter) => filter.kind === 'search' && !filter.hidden);
  const active = def.filters.filter((filter) => query.filters[filter.key] !== undefined && query.filters[filter.key] !== 'any');
  const anyActive = active.length > 0;
  const clearHref = href(base, new URLSearchParams(), Object.fromEntries((def.defaults ? Object.keys(def.defaults.values) : []).map((key) => [key, 'any'])));
  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const captionId = `caption-${def.key}`;

  return (
    <>
      <PageHeader
        title={strings.title}
        intro={strings.intro}
        stamp={{ text: fill(config.ui.states!.loadedAt!, { time: loadedAt }), time: loadedAt }}
        action={
          <>
            {canExport ? (
              <a className="button" href={`/api/${def.key}/export${current ? `?${current}` : ''}`}>
                {config.ui.table!.export}
              </a>
            ) : null}
            {canCreate && strings.create ? (
              <Link className="button button--primary" href={`${base}/new`}>
                {strings.create}
              </Link>
            ) : null}
          </>
        }
      />

      <div className="toolbar">
        {search_ ? (
          <SearchField
            key={`${base}?${current}`}
            base={base}
            current={current}
            label={strings.filters?.q ?? config.ui.filters!.search!}
            value={query.filters.q ?? ''}
          />
        ) : null}
        {visibleFilters.length ? (
          <FilterForm base={base} current={current} keys={visibleFilters.map((filter) => filter.key)}>
            <fieldset className="filters__set">
              <legend className="visually-hidden">{config.ui.filters!.legend}</legend>
              {visibleFilters.map((filter) => {
                const id = `filter-${filter.key}`;
                const label = strings.filters?.[filter.key] ?? filter.key;
                const value = query.filters[filter.key];
                if (filter.kind === 'select') {
                  const words = filter.set === 'roles' ? (config.roles as Record<string, string>) : optionWords(config, filter.set);
                  return (
                    <div className="field" key={filter.key}>
                      <label htmlFor={id}>{label}</label>
                      <select id={id} name={filter.key} defaultValue={value ?? ''}>
                        <option value="">{config.ui.filters!.all}</option>
                        {(filter.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {words[option] ?? option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                const dateValue = value === 'today' ? ctx.today : value === 'any' ? '' : (value ?? '');
                return (
                  <div className="field" key={filter.key}>
                    <label htmlFor={id}>{label}</label>
                    <input id={id} name={filter.key} type="date" defaultValue={dateValue} aria-describedby={`${id}-hint`} />
                    <span className="hint" id={`${id}-hint`}>
                      {config.ui.filters!.dateHint}
                    </span>
                  </div>
                );
              })}
            </fieldset>
            <button type="submit" className="button">
              {config.ui.filters!.apply}
            </button>
          </FilterForm>
        ) : null}
      </div>

      {anyActive ? (
        <div className="chips" aria-label={config.ui.filters!.active}>
          <ul>
            {active.map((filter) => {
              const value = query.filters[filter.key]!;
              const label = `${strings.filters?.[filter.key] ?? filter.key}: ${valueLabel(config, filter, value)}`;
              const removal = query.defaulted.includes(filter.key) ? 'any' : null;
              return (
                <li key={filter.key}>
                  <Link
                    className="chip"
                    href={href(base, params, { [filter.key]: removal, page: null })}
                    aria-label={fill(config.ui.filters!.remove!, { label })}
                  >
                    {label}
                    <span aria-hidden="true" className="chip__x">
                      {config.ui.filters!.removeMark}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link className="button button--quiet" href={clearHref}>
            {config.ui.filters!.clearAll}
          </Link>
        </div>
      ) : null}

      <p role="status" className="result-count" id="result-count">
        {result ? fill(strings.count, { n: number(config, result.total) }) : ''}
      </p>

      {!result ? (
        <StatePanel tone="danger" title={strings.error} role="alert">
          <RetryButton />
        </StatePanel>
      ) : result.total === 0 && firstUse ? (
        <StatePanel tone="info" title={strings.empty}>
          {canCreate && strings.create ? (
            <Link className="button button--primary" href={`${base}/new`}>
              {strings.create}
            </Link>
          ) : null}
        </StatePanel>
      ) : result.total === 0 ? (
        <StatePanel tone="neutral" title={config.ui.states!.filteredEmpty!.replace('{module}', strings.label.toLowerCase())}>
          <Link className="button" href={clearHref}>
            {config.ui.filters!.clearAll}
          </Link>
        </StatePanel>
      ) : (
        <div className="table-wrap" role="region" aria-labelledby={captionId} tabIndex={0}>
          <table className="table">
            <caption id={captionId}>{strings.caption}</caption>
            <thead>
              <tr>
                {def.columns.map((column) => {
                  const label = strings.columns[column.key] ?? column.key;
                  const sorted = query.sortKey === column.key;
                  const ariaSort = column.sort ? (sorted ? (query.sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined;
                  const nextDir = sorted && query.sortDir === 'asc' ? 'desc' : 'asc';
                  return (
                    <th key={column.key} scope="col" aria-sort={ariaSort} className={`col--${column.type}`}>
                      {column.sort ? (
                        <SortButton
                          href={href(base, params, { sort: `${column.key}.${nextDir}`, page: null })}
                          label={fill(config.ui.table!.sortBy!, {
                            column: label,
                            direction: nextDir === 'asc' ? config.ui.table!.ascending! : config.ui.table!.descending!,
                          })}
                        >
                          {label}
                          <span className="sort__state">
                            {sorted ? (query.sortDir === 'asc' ? config.ui.table!.ascendingShort : config.ui.table!.descendingShort) : ''}
                          </span>
                        </SortButton>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
                <th scope="col" className="col--actions">
                  {config.ui.table!.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row) => {
                const labels = def.label(row);
                const actions = (row.actions as unknown as string[]) ?? [];
                return (
                  <tr key={String(row.id)}>
                    {def.columns.map((column) =>
                      column.primary ? (
                        <th key={column.key} scope="row" className={`col--${column.type}`}>
                          <Link
                            href={`${base}/${row.id}?back=${encodeURIComponent(listUrl)}`}
                            aria-label={strings.open ? fill(strings.open, labels) : undefined}
                          >
                            <Cell config={config} column={column} value={row[column.key]} />
                          </Link>
                        </th>
                      ) : (
                        <td key={column.key} className={`col--${column.type}`}>
                          <Cell config={config} column={column} value={row[column.key]} />
                        </td>
                      ),
                    )}
                    <td className="col--actions">
                      <div className="row-actions">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result && result.total > 0 ? (
        <nav className="pagination" aria-label={config.ui.table!.pagination}>
          <p>{fill(config.ui.table!.pageOf!, { page: result.page, pages })}</p>
          <ul>
            <li>
              {result.page > 1 ? (
                <Link className="button" href={href(base, params, { page: String(result.page - 1) })} rel="prev">
                  {config.ui.table!.previous}
                </Link>
              ) : null}
            </li>
            <li>
              {result.page < pages ? (
                <Link className="button" href={href(base, params, { page: String(result.page + 1) })} rel="next">
                  {config.ui.table!.next}
                </Link>
              ) : null}
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
}
