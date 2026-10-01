import { HttpError, type Ctx } from './authz';
import { all, get, logPlan, type Params, type Row } from './db';
import { can, type ModuleKey } from './matrix';
import { isDate } from './time';
import type { FieldDef, Values } from './validate';

// One list engine, configured per module by data. Paging, sorting and
// filtering are done by the database; only one page of rows, and only the
// columns the table shows, leave the server. Every filter, the search, the
// sort and the page arrive in the query string, which is what lets a list be
// bookmarked, shared, reloaded and reached from a KPI.

export type ColumnType = 'text' | 'number' | 'money' | 'date' | 'datetime' | 'status' | 'option';

export type Column = {
  key: string;
  type: ColumnType;
  // The SQL expression the column sorts by. Absent: not sortable.
  sort?: string;
  // The status or option set whose words and tone the cell uses.
  set?: string;
  // The record's own link: the cell opens its detail.
  primary?: boolean;
};

export type Where = { sql: string; params: Params };

export type Filter = {
  key: string;
  kind: 'select' | 'date' | 'search';
  set?: string;
  options?: readonly string[];
  // Turns the value into a clause; null means the value is not acceptable and
  // the filter is ignored.
  apply: (value: string, ctx: Ctx) => Where | null;
  // Shown in the filter bar; hidden filters are reached from a KPI or a link
  // and still appear as removable chips.
  hidden?: boolean;
};

export type ActionDef = {
  key: string;
  // The matrix action that grants it. Several actions may share a grant.
  grant: string;
  when: (row: Row, ctx: Ctx) => boolean;
  destructive?: boolean;
  fields?: FieldDef[];
  run: (ctx: Ctx, row: Row, values: Values) => void;
};

export type ModuleDef = {
  key: ModuleKey;
  from: string;
  select: (ctx: Ctx) => string;
  idColumn: string;
  columns: Column[];
  defaultSort: string;
  filters: Filter[];
  // Filters applied when the query names none of the listed keys; each
  // carries "any" as the value that switches it off.
  defaults?: { when: string[]; values: Record<string, string> };
  scope?: (ctx: Ctx) => Where | null;
  sum?: string;
  label: (row: Row) => Record<string, string | number>;
  detail?: string[];
  create?: { fields: FieldDef[]; run: (ctx: Ctx, values: Values, key: string) => number };
  update?: { fields: FieldDef[]; when?: (row: Row) => boolean; run: (ctx: Ctx, row: Row, values: Values) => void };
  actions: ActionDef[];
};

export const PAGE_SIZES = [10, 25, 50];
export const DEFAULT_PAGE_SIZE = 25;
export const EXPORT_LIMIT = 5000;

export type ListQuery = {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  filters: Record<string, string>;
  defaulted: string[];
};

export function readQuery(def: ModuleDef, search: URLSearchParams): ListQuery {
  const page = Math.max(1, Math.min(100000, Number.parseInt(search.get('page') ?? '1', 10) || 1));
  const size = Number.parseInt(search.get('pageSize') ?? '', 10);
  const pageSize = PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE;
  const [key, dir] = (search.get('sort') ?? def.defaultSort).split('.');
  const sortable = def.columns.find((column) => column.key === key && column.sort);
  const [defaultKey, defaultDir] = def.defaultSort.split('.');
  const filters: Record<string, string> = {};
  for (const filter of def.filters) {
    const value = search.get(filter.key);
    if (value !== null && value !== '') filters[filter.key] = value.slice(0, 80);
  }
  const defaulted: string[] = [];
  if (def.defaults && !def.defaults.when.some((name) => name in filters)) {
    for (const [name, value] of Object.entries(def.defaults.values)) {
      filters[name] = value;
      defaulted.push(name);
    }
  }
  return {
    page,
    pageSize,
    sortKey: sortable ? key! : defaultKey!,
    sortDir: sortable ? (dir === 'desc' ? 'desc' : 'asc') : (defaultDir as 'asc' | 'desc'),
    filters,
    defaulted,
  };
}

function whereOf(def: ModuleDef, ctx: Ctx, query: ListQuery): Where {
  const clauses: string[] = [];
  const params: Params = [];
  const scope = def.scope?.(ctx);
  if (scope) {
    clauses.push(`(${scope.sql})`);
    params.push(...scope.params);
  }
  for (const filter of def.filters) {
    const value = query.filters[filter.key];
    if (value === undefined || value === 'any') continue;
    const clause = filter.apply(value, ctx);
    if (!clause) continue;
    clauses.push(`(${clause.sql})`);
    params.push(...clause.params);
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export type ListResult = {
  items: Row[];
  total: number;
  page: number;
  pageSize: number;
  sum: number | null;
};

export function runList(def: ModuleDef, ctx: Ctx, query: ListQuery, limit?: number): ListResult {
  const where = whereOf(def, ctx, query);
  const column = def.columns.find((candidate) => candidate.key === query.sortKey)!;
  const order = `ORDER BY ${column.sort} ${query.sortDir === 'desc' ? 'DESC' : 'ASC'}, ${def.idColumn} ${query.sortDir === 'desc' ? 'DESC' : 'ASC'}`;
  const counted = get(
    `SELECT COUNT(*) AS total${def.sum ? `, COALESCE(SUM(${def.sum}), 0) AS sum` : ''} FROM ${def.from} ${where.sql}`,
    where.params,
  )!;
  const total = Number(counted.total);
  const pageSize = limit ?? query.pageSize;
  const page = limit ? 1 : query.page;
  const sql = `SELECT ${def.select(ctx)} FROM ${def.from} ${where.sql} ${order} LIMIT ? OFFSET ?`;
  const params = [...where.params, pageSize, (page - 1) * pageSize];
  logPlan(`${def.key}:list:${query.sortKey}`, sql, params);
  logPlan(`${def.key}:count`, `SELECT COUNT(*) FROM ${def.from} ${where.sql}`, where.params);
  const items = all(sql, params).map((row) => withActions(def, ctx, row));
  return { items, total, page, pageSize, sum: def.sum ? Number(counted.sum) : null };
}

// One record, through the same scope as the list. Out of scope and missing are
// the same answer: 404, with nothing in the body.
export function findRecord(def: ModuleDef, ctx: Ctx, id: string): Row {
  if (!/^\d{1,12}$/.test(id)) throw new HttpError(404, 'notFound');
  const scope = def.scope?.(ctx);
  const clauses = [`${def.idColumn} = ?`];
  const params: Params = [Number(id)];
  if (scope) {
    clauses.push(`(${scope.sql})`);
    params.push(...scope.params);
  }
  const row = get(`SELECT ${def.select(ctx)} FROM ${def.from} WHERE ${clauses.join(' AND ')}`, params);
  if (!row) throw new HttpError(404, 'notFound');
  return withActions(def, ctx, row);
}

// The actions a row carries: the role holds the grant and the record's state
// allows it. The server checks both again when the action is called.
export function withActions(def: ModuleDef, ctx: Ctx, row: Row): Row & { actions: string[] } {
  const actions = def.actions
    .filter((action) => can(ctx.role, def.key, action.grant) && action.when(row, ctx))
    .map((action) => action.key);
  if (def.update && can(ctx.role, def.key, 'update') && (def.update.when?.(row) ?? true)) actions.push('edit');
  return Object.assign(row, { actions }) as Row & { actions: string[] };
}

// Helpers the module definitions share.
export const eq = (sql: string) => (value: string): Where => ({ sql: `${sql} = ?`, params: [value] });
export const oneOf = (sql: string, options: readonly string[]) => (value: string): Where | null =>
  options.includes(value) ? { sql: `${sql} = ?`, params: [value] } : null;
export const dateFrom = (sql: string) => (value: string, ctx: Ctx): Where | null => {
  const date = value === 'today' ? ctx.today : value;
  return isDate(date) ? { sql: `${sql} >= ?`, params: [date] } : null;
};
export const dateTo = (sql: string) => (value: string, ctx: Ctx): Where | null => {
  const date = value === 'today' ? ctx.today : value;
  return isDate(date) ? { sql: `${sql} <= ?`, params: [date] } : null;
};
export const dateIs = (sql: string) => (value: string, ctx: Ctx): Where | null => {
  const date = value === 'today' ? ctx.today : value;
  return isDate(date) ? { sql: `${sql} = ?`, params: [date] } : null;
};
export const prefix = (sql: string) => (value: string): Where | null => {
  const text = value.trim().replace(/[%_\\]/g, '');
  return text ? { sql: `${sql} LIKE ?`, params: [`${text}%`] } : null;
};
