import type { Ctx } from './authz';
import { fill } from './config';
import { all, get, type Params } from './db';
import { failIf } from './faults';
import { money, number, percent } from './format';
import { can, type ModuleKey, type Role } from './matrix';
import { addDays, monthStart, weekStart } from './time';

// Eight figures, each a definition before it is a card: a question, a formula
// implemented once here on the server, a period, thresholds read from the
// configuration, and a drill down to exactly the records it counts. The drill
// list applies the same clauses, so the card and the list cannot disagree.

export type KpiStatus = 'ok' | 'warning' | 'danger';

export type Kpi = {
  key: string;
  label: string;
  value: number;
  display: string;
  detail: string;
  unit: 'count' | 'money' | 'percentage';
  period: string;
  status: KpiStatus;
  statusWord: string;
  asOf: string;
  drill: string;
  // The drill as the list endpoint answers it, for whoever checks the figure.
  api: string;
  // What the drill list states that must equal the figure.
  equals: 'total' | 'sum' | 'average';
  expected: number;
};

type Definition = {
  key: string;
  roles: Role[];
  module: ModuleKey;
  drill: string;
  api: string;
  unit: Kpi['unit'];
  equals: Kpi['equals'];
  compute: (ctx: Ctx) => { value: number; expected: number; values: Record<string, string | number> };
  status: (value: number, thresholds: Record<string, number>) => KpiStatus;
};

const n = (sql: string, params: Params = []) => Number(get(sql, params)?.v ?? 0);

function housekeepingRooms(ctx: Ctx): { sql: string; params: Params } {
  return ctx.role === 'housekeeping'
    ? { sql: ' AND id IN (SELECT room_id FROM tasks WHERE assignee_id = ? AND date = ?)', params: [ctx.account.id, ctx.today] }
    : { sql: '', params: [] };
}

export function revenueBetween(from: string, to: string): number {
  return n(
    "SELECT COALESCE(SUM(CASE WHEN reverses_id IS NULL THEN amount ELSE -amount END), 0) AS v FROM ledger WHERE kind = 'income' AND date BETWEEN ? AND ?",
    [from, to],
  );
}

// Room revenue over room nights sold, month to date: every night from the
// first of the month to tonight that a stay in house or departed occupied.
export function rateReport(ctx: Ctx): { days: { date: string; nights: number; revenue: number }[]; nights: number; revenue: number; average: number } {
  const days = all(
    `WITH RECURSIVE d(day) AS (SELECT ? UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < ?)
     SELECT d.day AS date, COUNT(s.id) AS nights, COALESCE(SUM(s.rate), 0) AS revenue
     FROM d LEFT JOIN stays s ON s.arrival <= d.day AND s.departure > d.day AND s.status IN ('inHouse','departed')
     GROUP BY d.day ORDER BY d.day`,
    [monthStart(ctx.today), ctx.today],
  ).map((row) => ({ date: String(row.date), nights: Number(row.nights), revenue: Number(row.revenue) }));
  const nights = days.reduce((total, day) => total + day.nights, 0);
  const revenue = days.reduce((total, day) => total + day.revenue, 0);
  return { days, nights, revenue, average: nights ? Math.round(revenue / nights) : 0 };
}

const above = (key: string, tone: KpiStatus) => (value: number, thresholds: Record<string, number>): KpiStatus =>
  typeof thresholds[key] === 'number' && value > thresholds[key]! ? tone : 'ok';

export const KPIS: Definition[] = [
  {
    key: 'occupancyTonight',
    roles: ['manager', 'frontDesk'],
    module: 'stays',
    drill: '/stays?night=today',
    api: '/api/stays?night=today',
    unit: 'percentage',
    equals: 'total',
    compute: (ctx) => {
      const occupied = n(
        "SELECT COUNT(*) AS v FROM stays WHERE arrival <= ? AND departure > ? AND status IN ('confirmed','inHouse')",
        [ctx.today, ctx.today],
      );
      const rooms = n("SELECT COUNT(*) AS v FROM rooms WHERE status <> 'outOfOrder'");
      return { value: rooms ? occupied / rooms : 0, expected: occupied, values: { occupied, rooms } };
    },
    // The threshold is a percentage in the configuration.
    status: (value, thresholds) =>
      typeof thresholds.lowPercent === 'number' && value * 100 < thresholds.lowPercent ? 'warning' : 'ok',
  },
  {
    key: 'arrivalsPending',
    roles: ['manager', 'frontDesk'],
    module: 'stays',
    drill: '/stays?arrival=today&status=confirmed',
    api: '/api/stays?arrival=today&status=confirmed',
    unit: 'count',
    equals: 'total',
    compute: (ctx) => {
      const value = n("SELECT COUNT(*) AS v FROM stays WHERE status = 'confirmed' AND arrival = ?", [ctx.today]);
      return { value, expected: value, values: {} };
    },
    status: () => 'ok',
  },
  {
    key: 'departuresPending',
    roles: ['manager', 'frontDesk'],
    module: 'stays',
    drill: '/stays?departure=today&status=inHouse',
    api: '/api/stays?departure=today&status=inHouse',
    unit: 'count',
    equals: 'total',
    compute: (ctx) => {
      const value = n("SELECT COUNT(*) AS v FROM stays WHERE status = 'inHouse' AND departure = ?", [ctx.today]);
      return { value, expected: value, values: {} };
    },
    status: () => 'ok',
  },
  {
    key: 'roomsToClean',
    roles: ['manager', 'frontDesk', 'housekeeping'],
    module: 'rooms',
    drill: '/rooms?status=dirty',
    api: '/api/rooms?status=dirty',
    unit: 'count',
    equals: 'total',
    compute: (ctx) => {
      const scope = housekeepingRooms(ctx);
      const value = n(`SELECT COUNT(*) AS v FROM rooms WHERE status = 'dirty'${scope.sql}`, scope.params);
      return { value, expected: value, values: {} };
    },
    status: above('warnAbove', 'warning'),
  },
  {
    key: 'revenueMonth',
    roles: ['manager', 'bookkeeper'],
    module: 'ledger',
    drill: '/ledger?kind=income&period=month',
    api: '/api/ledger?kind=income&period=month',
    unit: 'money',
    equals: 'sum',
    compute: (ctx) => {
      const value = revenueBetween(monthStart(ctx.today), ctx.today);
      // The same days of the previous month, clamped to its length.
      const previousEnd = addDays(monthStart(ctx.today), -1);
      const previousStart = monthStart(previousEnd);
      const day = Math.min(Number(ctx.today.slice(8, 10)), Number(previousEnd.slice(8, 10)));
      const previous = revenueBetween(previousStart, `${previousStart.slice(0, 8)}${String(day).padStart(2, '0')}`);
      return { value, expected: value, values: { previous: money(ctx.config, previous) } };
    },
    status: () => 'ok',
  },
  {
    key: 'overdueFolios',
    roles: ['manager', 'bookkeeper', 'frontDesk'],
    module: 'folios',
    drill: '/folios?status=overdue',
    api: '/api/folios?status=overdue',
    unit: 'count',
    equals: 'total',
    compute: (ctx) => {
      const row = get(
        'SELECT COUNT(*) AS c, COALESCE(SUM(total - paid), 0) AS a FROM folios WHERE voided = 0 AND paid < total AND due_date < ?',
        [ctx.today],
      )!;
      return { value: Number(row.c), expected: Number(row.c), values: { amount: money(ctx.config, Number(row.a)) } };
    },
    status: above('dangerAbove', 'danger'),
  },
  {
    key: 'itemsBelowThreshold',
    roles: ['manager', 'storekeeper'],
    module: 'items',
    drill: '/stock?level=low',
    api: '/api/items?level=low',
    unit: 'count',
    equals: 'total',
    compute: () => {
      const value = n('SELECT COUNT(*) AS v FROM items WHERE quantity <= threshold');
      return { value, expected: value, values: {} };
    },
    status: above('warnAbove', 'warning'),
  },
  {
    key: 'averageRate',
    roles: ['manager', 'bookkeeper'],
    module: 'reports',
    drill: '/reports/rate?period=month',
    api: '/api/reports/rate?period=month',
    unit: 'money',
    equals: 'average',
    compute: (ctx) => {
      const report = rateReport(ctx);
      return { value: report.average, expected: report.average, values: { nights: report.nights } };
    },
    status: () => 'ok',
  },
];

type Cached = { at: number; kpis: Kpi[] };
// Held on globalThis: the pages and the route handlers are separate bundles,
// and one cache per bundle would give the API and the page different times.
const cacheHolder = globalThis as typeof globalThis & { __hotelKpiCache?: Map<string, Cached> };
const cache = (cacheHolder.__hotelKpiCache ??= new Map<string, Cached>());
const CACHE_MS = 60_000;

// Computed in one pass for the role, cached for a minute per role (per
// account for housekeeping, whose figures are scoped to their tasks), with the
// time of computation shown on every card.
export function computeKpis(ctx: Ctx): { kpis: Kpi[]; cached: boolean } {
  failIf('overview.kpis');
  const key = ctx.role === 'housekeeping' ? `${ctx.role}:${ctx.account.id}` : ctx.role;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return { kpis: hit.kpis, cached: true };
  }
  const asOf = new Date().toISOString();
  const kpis: Kpi[] = [];
  for (const definition of KPIS) {
    const strings = ctx.config.kpis[definition.key];
    if (!strings || !strings.visible) continue;
    if (!definition.roles.includes(ctx.role) || !can(ctx.role, definition.module, 'view')) continue;
    const result = definition.compute(ctx);
    const status = definition.status(result.value, strings.thresholds ?? {});
    const display =
      definition.unit === 'money'
        ? money(ctx.config, result.value)
        : definition.unit === 'percentage'
          ? percent(ctx.config, result.value)
          : number(ctx.config, result.value);
    kpis.push({
      key: definition.key,
      label: strings.label,
      value: result.value,
      display,
      detail: fill(strings.detail, { ...result.values, value: display }),
      unit: definition.unit,
      period: strings.period,
      status,
      statusWord: ctx.config.statuses.kpi?.[status] ?? status,
      asOf,
      drill: definition.drill,
      api: definition.api,
      equals: definition.equals,
      expected: result.expected,
    });
  }
  cache.set(key, { at: Date.now(), kpis });
  return { kpis, cached: false };
}

// ---------------------------------------------------------------------------

export type Trend = {
  weeks: { start: string; label: string; income: number; expense: number }[];
  summary: string;
};

export function trend(ctx: Ctx): Trend | null {
  if (!(['manager', 'bookkeeper'] as Role[]).includes(ctx.role) || !can(ctx.role, 'ledger', 'view')) return null;
  failIf('overview.trend');
  const first = addDays(weekStart(ctx.today), -77);
  const rows = all(
    `SELECT date, kind, SUM(CASE WHEN reverses_id IS NULL THEN amount ELSE -amount END) AS total
     FROM ledger WHERE date BETWEEN ? AND ? GROUP BY date, kind`,
    [first, ctx.today],
  );
  const weeks = Array.from({ length: 12 }, (_, index) => {
    const start = addDays(first, index * 7);
    return { start, label: fill(ctx.config.charts.trend.weekLabel ?? '{n}', { n: index + 1 }), income: 0, expense: 0 };
  });
  for (const row of rows) {
    const index = Math.floor((Date.parse(`${row.date}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / (7 * 86_400_000));
    const week = weeks[index];
    if (!week) continue;
    if (row.kind === 'income') week.income += Number(row.total);
    else week.expense += Number(row.total);
  }
  const income = weeks.map((week) => week.income);
  const lowest = income.indexOf(Math.min(...income)) + 1;
  const firstValue = income[0] ?? 0;
  const lastValue = income[income.length - 1] ?? 0;
  const template = lastValue >= firstValue ? ctx.config.charts.trend.summaryUp : ctx.config.charts.trend.summaryDown;
  const summary = fill(template ?? '', {
    first: money(ctx.config, firstValue),
    last: money(ctx.config, lastValue),
    lowest,
  });
  return { weeks, summary };
}

export type Distribution = { counts: { status: string; label: string; count: number }[]; summary: string };

export function distribution(ctx: Ctx): Distribution | null {
  if (!(['manager', 'frontDesk', 'housekeeping'] as Role[]).includes(ctx.role) || !can(ctx.role, 'rooms', 'view')) return null;
  failIf('overview.distribution');
  const scope = housekeepingRooms(ctx);
  const rows = all(`SELECT status, COUNT(*) AS c FROM rooms WHERE 1 = 1${scope.sql} GROUP BY status`, scope.params);
  const byStatus = new Map(rows.map((row) => [String(row.status), Number(row.c)]));
  const counts = ['available', 'occupied', 'dirty', 'cleaning', 'outOfOrder'].map((status) => ({
    status,
    label: ctx.config.statuses.rooms?.[status] ?? status,
    count: byStatus.get(status) ?? 0,
  }));
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const summary = fill(ctx.config.charts.distribution.summary ?? '', {
    total,
    list: counts.map((item) => `${item.label} ${item.count}`).join(', '),
  });
  return { counts, summary };
}
