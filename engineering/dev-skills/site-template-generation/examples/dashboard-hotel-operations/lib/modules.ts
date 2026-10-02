import { HttpError, type Ctx } from './authz';
import { all, get, run, tx, type Row } from './db';
import {
  dateFrom,
  dateIs,
  dateTo,
  eq,
  oneOf,
  prefix,
  type ModuleDef,
  type Where,
} from './list';
import { can, ROLE_KEYS, type ModuleKey } from './matrix';
import { addDays, isDate, monthStart, nightsBetween } from './time';
import type { FieldDef } from './validate';

// The modules of the hotel, declared as data for the list engine: their
// columns, filters, record scope, forms and named actions. The words are in
// the configuration; the rules are here, and the database enforces the ones a
// concurrent writer could otherwise break.

export const OPTIONS = {
  roomTypes: ['single', 'double', 'twin', 'family'],
  roomStatuses: ['available', 'occupied', 'dirty', 'cleaning', 'outOfOrder'],
  stayStatuses: ['provisional', 'confirmed', 'inHouse', 'departed', 'cancelled'],
  folioStatuses: ['settled', 'open', 'overdue', 'voided'],
  taskKinds: ['departureClean', 'stayOver', 'deepClean'],
  taskStatuses: ['todo', 'inProgress', 'done'],
  stores: ['bar', 'kitchen', 'linen'],
  levels: ['low', 'ok'],
  movementKinds: ['in', 'out', 'transfer'],
  ledgerKinds: ['income', 'expense'],
  ledgerStates: ['posted', 'reversed', 'reversal'],
  categories: ['rooms', 'bar', 'kitchen', 'supplies', 'wages', 'utilities', 'maintenance', 'other'],
  methods: ['card', 'cash', 'transfer'],
  periods: ['month', 'week', 'today'],
  outcomes: ['allowed', 'refused'],
  activity: ['active', 'inactive'],
  roles: ROLE_KEYS,
} as const;

const now = () => new Date().toISOString();

function safeDate(ctx: Ctx): string {
  if (!isDate(ctx.today)) throw new Error('today is not a date');
  return ctx.today;
}

export function folioStatusSql(today: string, alias = 'f'): string {
  if (!isDate(today)) throw new Error('today is not a date');
  return `CASE WHEN ${alias}.voided = 1 THEN 'voided' WHEN ${alias}.paid >= ${alias}.total THEN 'settled' WHEN ${alias}.due_date < '${today}' THEN 'overdue' ELSE 'open' END`;
}

function folioStatusWhere(value: string, ctx: Ctx): Where | null {
  const today = ctx.today;
  switch (value) {
    case 'voided':
      return { sql: 'f.voided = 1', params: [] };
    case 'settled':
      return { sql: 'f.voided = 0 AND f.paid >= f.total', params: [] };
    case 'overdue':
      return { sql: 'f.voided = 0 AND f.paid < f.total AND f.due_date < ?', params: [today] };
    case 'open':
      return { sql: 'f.voided = 0 AND f.paid < f.total AND f.due_date >= ?', params: [today] };
    default:
      return null;
  }
}

function periodWhere(column: string) {
  return (value: string, ctx: Ctx): Where | null => {
    if (value === 'today') return { sql: `${column} = ?`, params: [ctx.today] };
    if (value === 'month') return { sql: `${column} BETWEEN ? AND ?`, params: [monthStart(ctx.today), ctx.today] };
    if (value === 'week') return { sql: `${column} BETWEEN ? AND ?`, params: [addDays(ctx.today, -6), ctx.today] };
    return null;
  };
}

// Creates the folio of a stay, numbered sequentially within the year. Called
// inside the caller's transaction.
export function createFolio(stayId: number, today: string): number {
  const stay = get('SELECT id, total, rate, arrival, departure FROM stays WHERE id = ?', [stayId]);
  if (!stay) throw new HttpError(404, 'notFound');
  if (get('SELECT id FROM folios WHERE stay_id = ?', [stayId])) throw new HttpError(409, 'folioExists');
  const year = Number(today.slice(0, 4));
  const next = Number(get('SELECT COALESCE(MAX(seq), 0) + 1 AS next FROM folios WHERE year = ?', [year])!.next);
  const number = `${year}-${String(next).padStart(5, '0')}`;
  const created = run(
    'INSERT INTO folios (stay_id, year, seq, number, total, paid, due_date, voided, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, 0, ?)',
    [stayId, year, next, number, Number(stay.total), addDays(String(stay.departure), 14), now()],
  );
  const nights = nightsBetween(String(stay.arrival), String(stay.departure));
  run('INSERT INTO folio_lines (folio_id, label, quantity, unit_amount) VALUES (?, ?, ?, ?)', [
    created.lastId,
    'room',
    nights,
    Number(stay.rate),
  ]);
  return created.lastId;
}

// ---------------------------------------------------------------------------

const rooms: ModuleDef = {
  key: 'rooms',
  from: 'rooms r',
  idColumn: 'r.id',
  select: () => 'r.id, r.number, r.type, r.floor, r.nightly_rate, r.status, r.out_of_order_reason',
  columns: [
    { key: 'number', type: 'text', sort: 'r.number', primary: true },
    { key: 'type', type: 'option', set: 'roomTypes', sort: 'r.type' },
    { key: 'floor', type: 'number', sort: 'r.floor' },
    { key: 'nightly_rate', type: 'money', sort: 'r.nightly_rate' },
    { key: 'status', type: 'status', set: 'rooms', sort: 'r.status' },
  ],
  defaultSort: 'number.asc',
  filters: [
    { key: 'status', kind: 'select', set: 'rooms', options: OPTIONS.roomStatuses, apply: oneOf('r.status', OPTIONS.roomStatuses) },
    { key: 'type', kind: 'select', set: 'roomTypes', options: OPTIONS.roomTypes, apply: oneOf('r.type', OPTIONS.roomTypes) },
    { key: 'q', kind: 'search', apply: prefix('r.number') },
  ],
  // Housekeeping reaches rooms only through today's tasks assigned to them.
  scope: (ctx) =>
    ctx.role === 'housekeeping'
      ? { sql: 'r.id IN (SELECT room_id FROM tasks WHERE assignee_id = ? AND date = ?)', params: [ctx.account.id, ctx.today] }
      : null,
  label: (row) => ({ room: String(row.number) }),
  detail: ['number', 'type', 'floor', 'nightly_rate', 'status', 'out_of_order_reason'],
  create: {
    fields: [
      { key: 'number', kind: 'text', required: true, max: 8 },
      { key: 'type', kind: 'select', required: true, options: OPTIONS.roomTypes },
      { key: 'floor', kind: 'int', required: true, min: 0, max: 20 },
      { key: 'nightlyRate', kind: 'money', required: true, min: 1 },
    ],
    run: (_ctx, values) =>
      run("INSERT INTO rooms (number, type, floor, nightly_rate, status) VALUES (?, ?, ?, ?, 'available')", [
        values.number as string,
        values.type as string,
        values.floor as number,
        values.nightlyRate as number,
      ]).lastId,
  },
  update: {
    fields: [
      { key: 'type', kind: 'select', required: true, options: OPTIONS.roomTypes },
      { key: 'floor', kind: 'int', required: true, min: 0, max: 20 },
      { key: 'nightlyRate', kind: 'money', required: true, min: 1 },
    ],
    run: (_ctx, row, values) =>
      void run('UPDATE rooms SET type = ?, floor = ?, nightly_rate = ? WHERE id = ?', [
        values.type as string,
        values.floor as number,
        values.nightlyRate as number,
        Number(row.id),
      ]),
  },
  actions: [
    {
      key: 'setOutOfOrder',
      grant: 'setOutOfOrder',
      when: (row) => row.status === 'available' || row.status === 'dirty' || row.status === 'cleaning',
      fields: [{ key: 'reason', kind: 'text', required: true, max: 200 }],
      run: (_ctx, row, values) =>
        void run("UPDATE rooms SET status = 'outOfOrder', out_of_order_reason = ? WHERE id = ?", [
          values.reason as string,
          Number(row.id),
        ]),
    },
    {
      key: 'returnToService',
      grant: 'setOutOfOrder',
      when: (row) => row.status === 'outOfOrder',
      run: (_ctx, row) =>
        void run("UPDATE rooms SET status = 'dirty', out_of_order_reason = NULL WHERE id = ?", [Number(row.id)]),
    },
    {
      key: 'markClean',
      grant: 'markClean',
      when: (row) => row.status === 'dirty' || row.status === 'cleaning',
      run: (_ctx, row) => void run("UPDATE rooms SET status = 'available' WHERE id = ?", [Number(row.id)]),
    },
  ],
};

// ---------------------------------------------------------------------------

const stayFields: FieldDef[] = [
  { key: 'guestId', kind: 'int', min: 1 },
  { key: 'guestName', kind: 'text', max: 120 },
  { key: 'roomId', kind: 'select', required: true, source: 'rooms' },
  { key: 'arrival', kind: 'date', required: true },
  { key: 'departure', kind: 'date', required: true },
  { key: 'adults', kind: 'int', required: true, min: 1, max: 8 },
  { key: 'children', kind: 'int', min: 0, max: 8 },
  { key: 'provisional', kind: 'boolean' },
];

const stays: ModuleDef = {
  key: 'stays',
  from: 'stays s JOIN guests g ON g.id = s.guest_id JOIN rooms r ON r.id = s.room_id LEFT JOIN folios f ON f.stay_id = s.id',
  idColumn: 's.id',
  select: (ctx) =>
    `s.id, g.name AS guest, s.guest_id, r.number AS room, r.type AS room_type, s.room_id, s.arrival, s.departure,
     CAST(julianday(s.departure) - julianday(s.arrival) AS INTEGER) AS nights, s.total, s.status, s.adults, s.children,
     s.rate, f.id AS folio_id, f.number AS folio, f.paid AS folio_paid, f.total AS folio_total,
     ${folioStatusSql(safeDate(ctx))} AS folio_status`,
  columns: [
    { key: 'guest', type: 'text', sort: 'g.name COLLATE NOCASE', primary: true },
    { key: 'room', type: 'text', sort: 'r.number' },
    { key: 'arrival', type: 'date', sort: 's.arrival' },
    { key: 'departure', type: 'date', sort: 's.departure' },
    { key: 'nights', type: 'number', sort: 'julianday(s.departure) - julianday(s.arrival)' },
    { key: 'total', type: 'money', sort: 's.total' },
    { key: 'status', type: 'status', set: 'stays', sort: 's.status' },
  ],
  defaultSort: 'arrival.asc',
  filters: [
    { key: 'status', kind: 'select', set: 'stays', options: OPTIONS.stayStatuses, apply: oneOf('s.status', OPTIONS.stayStatuses) },
    { key: 'arrivalFrom', kind: 'date', apply: dateFrom('s.arrival') },
    { key: 'arrivalTo', kind: 'date', apply: dateTo('s.arrival') },
    { key: 'departureFrom', kind: 'date', apply: dateFrom('s.departure') },
    { key: 'departureTo', kind: 'date', apply: dateTo('s.departure') },
    { key: 'roomType', kind: 'select', set: 'roomTypes', options: OPTIONS.roomTypes, apply: oneOf('r.type', OPTIONS.roomTypes) },
    {
      key: 'q',
      kind: 'search',
      apply: (value) => {
        const text = value.trim().replace(/[%_\\]/g, '');
        if (!text) return null;
        return { sql: '(g.name LIKE ? OR r.number = ?)', params: [`${text}%`, text] };
      },
    },
    // Reached from the KPIs: the stays that occupy a room tonight, the
    // arrivals and the departures of a given day.
    {
      key: 'night',
      kind: 'date',
      hidden: true,
      apply: (value, ctx) => {
        const date = value === 'today' ? ctx.today : value;
        if (!isDate(date)) return null;
        return {
          sql: "s.arrival <= ? AND s.departure > ? AND s.status IN ('confirmed','inHouse')",
          params: [date, date],
        };
      },
    },
    { key: 'arrival', kind: 'date', hidden: true, apply: dateIs('s.arrival') },
    { key: 'departure', kind: 'date', hidden: true, apply: dateIs('s.departure') },
  ],
  defaults: {
    when: ['arrivalFrom', 'arrivalTo', 'departureFrom', 'departureTo', 'night', 'arrival', 'departure', 'q', 'status'],
    values: { arrivalFrom: 'today' },
  },
  label: (row) => ({
    guest: String(row.guest),
    room: String(row.room),
    arrival: String(row.arrival),
    departure: String(row.departure),
  }),
  detail: ['guest', 'room', 'arrival', 'departure', 'nights', 'adults', 'children', 'rate', 'total', 'status', 'folio', 'folio_status'],
  create: {
    fields: stayFields,
    run: (ctx, values, key) => {
      const arrival = values.arrival as string;
      const departure = values.departure as string;
      if (arrival < ctx.today) throw new HttpError(422, 'past', 'arrival');
      if (departure <= arrival) throw new HttpError(422, 'beforeArrival', 'departure');
      if (nightsBetween(arrival, departure) > 60) throw new HttpError(422, 'tooLong', 'departure');
      const room = get('SELECT id, nightly_rate, status FROM rooms WHERE id = ?', [Number(values.roomId)]);
      if (!room) throw new HttpError(422, 'invalid', 'roomId');
      let guestId = values.guestId as number | null;
      if (guestId) {
        if (!get('SELECT id FROM guests WHERE id = ?', [guestId])) throw new HttpError(422, 'invalid', 'guestId');
      } else {
        if (!values.guestName) throw new HttpError(422, 'required', 'guestName');
        guestId = run('INSERT INTO guests (name, created_at, created_by_role) VALUES (?, ?, ?)', [
          values.guestName as string,
          now(),
          ctx.role,
        ]).lastId;
      }
      const rate = Number(room.nightly_rate);
      const created = run(
        `INSERT INTO stays (room_id, guest_id, arrival, departure, adults, children, status, rate, total, created_by, idempotency_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(room.id),
          guestId,
          arrival,
          departure,
          values.adults as number,
          (values.children as number | null) ?? 0,
          values.provisional ? 'provisional' : 'confirmed',
          rate,
          rate * nightsBetween(arrival, departure),
          ctx.account.id,
          key,
          now(),
        ],
      );
      run('UPDATE guests SET last_stay_at = MAX(COALESCE(last_stay_at, ?), ?) WHERE id = ?', [arrival, arrival, guestId]);
      return created.lastId;
    },
  },
  update: {
    fields: [
      { key: 'arrival', kind: 'date', required: true },
      { key: 'departure', kind: 'date', required: true },
      { key: 'adults', kind: 'int', required: true, min: 1, max: 8 },
      { key: 'children', kind: 'int', min: 0, max: 8 },
    ],
    when: (row) => row.status === 'provisional' || row.status === 'confirmed',
    run: (ctx, row, values) => {
      if (row.status !== 'provisional' && row.status !== 'confirmed') throw new HttpError(409, 'state');
      const arrival = values.arrival as string;
      const departure = values.departure as string;
      if (departure <= arrival) throw new HttpError(422, 'beforeArrival', 'departure');
      if (arrival < ctx.today && arrival !== row.arrival) throw new HttpError(422, 'past', 'arrival');
      run('UPDATE stays SET arrival = ?, departure = ?, adults = ?, children = ?, total = rate * ? WHERE id = ?', [
        arrival,
        departure,
        values.adults as number,
        (values.children as number | null) ?? 0,
        nightsBetween(arrival, departure),
        Number(row.id),
      ]);
    },
  },
  actions: [
    {
      key: 'confirm',
      grant: 'confirm',
      when: (row) => row.status === 'provisional',
      run: (_ctx, row) => void run("UPDATE stays SET status = 'confirmed' WHERE id = ?", [Number(row.id)]),
    },
    {
      key: 'checkIn',
      grant: 'checkIn',
      when: (row, ctx) => row.status === 'confirmed' && String(row.arrival) <= ctx.today && String(row.departure) > ctx.today,
      run: (ctx, row) => {
        const room = get('SELECT status FROM rooms WHERE id = ?', [Number(row.room_id)]);
        if (room?.status === 'outOfOrder' || room?.status === 'occupied') throw new HttpError(409, 'roomUnavailable');
        run("UPDATE stays SET status = 'inHouse' WHERE id = ?", [Number(row.id)]);
        run("UPDATE rooms SET status = 'occupied' WHERE id = ?", [Number(row.room_id)]);
        if (!row.folio_id) createFolio(Number(row.id), ctx.today);
      },
    },
    {
      key: 'checkOut',
      grant: 'checkOut',
      when: (row, ctx) =>
        row.status === 'inHouse' && (row.folio_status === 'settled' || can(ctx.role, 'stays', 'checkOutOverride')),
      run: (ctx, row, values) => {
        const settled = row.folio_status === 'settled';
        if (!settled && !(values.override && can(ctx.role, 'stays', 'checkOutOverride'))) {
          throw new HttpError(409, 'folioUnsettled');
        }
        run("UPDATE stays SET status = 'departed' WHERE id = ?", [Number(row.id)]);
        run("UPDATE rooms SET status = 'dirty' WHERE id = ?", [Number(row.room_id)]);
      },
      fields: [{ key: 'override', kind: 'boolean' }],
    },
    {
      key: 'cancel',
      grant: 'cancel',
      destructive: true,
      when: (row, ctx) => (row.status === 'provisional' || row.status === 'confirmed') && String(row.arrival) >= ctx.today,
      run: (_ctx, row) => void run("UPDATE stays SET status = 'cancelled' WHERE id = ?", [Number(row.id)]),
    },
  ],
};

// ---------------------------------------------------------------------------

const guests: ModuleDef = {
  key: 'guests',
  from: 'guests g',
  idColumn: 'g.id',
  // The notes field is never selected for the bookkeeper, and never by a list.
  select: (ctx) =>
    `g.id, g.name, g.email, g.phone, g.last_stay_at, g.created_at${ctx.role === 'bookkeeper' ? '' : ', g.notes'}`,
  columns: [
    { key: 'name', type: 'text', sort: 'g.name COLLATE NOCASE', primary: true },
    { key: 'email', type: 'text' },
    { key: 'phone', type: 'text' },
    { key: 'last_stay_at', type: 'date', sort: 'g.last_stay_at' },
  ],
  defaultSort: 'name.asc',
  filters: [{ key: 'q', kind: 'search', apply: prefix('g.name') }],
  // The desk sees the guests it is dealing with: those with a stay still to
  // come or in house, those who left within thirty days, and those it created.
  scope: (ctx) =>
    ctx.role === 'frontDesk'
      ? {
          sql: `g.created_by_role = 'frontDesk' OR EXISTS (SELECT 1 FROM stays s WHERE s.guest_id = g.id
                AND (s.status IN ('provisional','confirmed','inHouse') OR s.departure >= ?))`,
          params: [addDays(ctx.today, -30)],
        }
      : null,
  label: (row) => ({ guest: String(row.name) }),
  detail: ['name', 'email', 'phone', 'last_stay_at', 'notes'],
  create: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'email', kind: 'email' },
      { key: 'phone', kind: 'phone' },
      { key: 'notes', kind: 'longtext', max: 500 },
    ],
    run: (ctx, values) =>
      run('INSERT INTO guests (name, email, phone, notes, created_at, created_by_role) VALUES (?, ?, ?, ?, ?, ?)', [
        values.name as string,
        values.email as string | null,
        values.phone as string | null,
        values.notes as string | null,
        now(),
        ctx.role,
      ]).lastId,
  },
  update: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'email', kind: 'email' },
      { key: 'phone', kind: 'phone' },
      { key: 'notes', kind: 'longtext', max: 500 },
    ],
    run: (_ctx, row, values) =>
      void run('UPDATE guests SET name = ?, email = ?, phone = ?, notes = ? WHERE id = ?', [
        values.name as string,
        values.email as string | null,
        values.phone as string | null,
        values.notes as string | null,
        Number(row.id),
      ]),
  },
  actions: [],
};

// ---------------------------------------------------------------------------

const folios: ModuleDef = {
  key: 'folios',
  from: 'folios f JOIN stays s ON s.id = f.stay_id JOIN guests g ON g.id = s.guest_id JOIN rooms r ON r.id = s.room_id',
  idColumn: 'f.id',
  select: (ctx) =>
    `f.id, f.number, g.name AS guest, r.number AS room, s.id AS stay_id, f.total, f.paid, f.total - f.paid AS due,
     f.due_date, ${folioStatusSql(safeDate(ctx))} AS status`,
  columns: [
    { key: 'number', type: 'text', sort: 'f.number', primary: true },
    { key: 'guest', type: 'text', sort: 'g.name COLLATE NOCASE' },
    { key: 'room', type: 'text', sort: 'r.number' },
    { key: 'total', type: 'money', sort: 'f.total' },
    { key: 'due', type: 'money', sort: 'f.total - f.paid' },
    { key: 'due_date', type: 'date', sort: 'f.due_date' },
    { key: 'status', type: 'status', set: 'folios' },
  ],
  defaultSort: 'due_date.desc',
  filters: [
    { key: 'status', kind: 'select', set: 'folios', options: OPTIONS.folioStatuses, apply: folioStatusWhere },
    { key: 'dueFrom', kind: 'date', apply: dateFrom('f.due_date') },
    { key: 'dueTo', kind: 'date', apply: dateTo('f.due_date') },
    {
      key: 'q',
      kind: 'search',
      apply: (value) => {
        const text = value.trim().replace(/[%_\\]/g, '');
        return text ? { sql: '(f.number LIKE ? OR g.name LIKE ?)', params: [`${text}%`, `${text}%`] } : null;
      },
    },
  ],
  sum: 'f.total - f.paid',
  label: (row) => ({ folio: String(row.number), guest: String(row.guest) }),
  detail: ['number', 'guest', 'room', 'total', 'paid', 'due', 'due_date', 'status'],
  create: {
    fields: [{ key: 'stayId', kind: 'int', required: true, min: 1 }],
    run: (ctx, values) => createFolio(values.stayId as number, ctx.today),
  },
  update: {
    fields: [{ key: 'dueDate', kind: 'date', required: true }],
    when: (row) => row.status !== 'voided' && row.status !== 'settled',
    run: (_ctx, row, values) => {
      if (row.status === 'voided' || row.status === 'settled') throw new HttpError(409, 'state');
      run('UPDATE folios SET due_date = ? WHERE id = ?', [values.dueDate as string, Number(row.id)]);
    },
  },
  actions: [
    {
      key: 'recordPayment',
      grant: 'recordPayment',
      when: (row) => row.status === 'open' || row.status === 'overdue',
      fields: [
        { key: 'amount', kind: 'money', required: true, min: 1 },
        { key: 'method', kind: 'select', required: true, options: OPTIONS.methods },
      ],
      run: (ctx, row, values) => {
        const amount = values.amount as number;
        if (amount > Number(row.due)) throw new HttpError(422, 'aboveDue', 'amount');
        run('UPDATE folios SET paid = paid + ? WHERE id = ?', [amount, Number(row.id)]);
        run(
          "INSERT INTO ledger (kind, category, amount, method, date, folio_id, author_id, created_at) VALUES ('income', 'rooms', ?, ?, ?, ?, ?, ?)",
          [amount, values.method as string, ctx.today, Number(row.id), ctx.account.id, now()],
        );
      },
    },
    {
      key: 'void',
      grant: 'void',
      destructive: true,
      when: (row) => (row.status === 'open' || row.status === 'overdue') && Number(row.paid) === 0,
      run: (_ctx, row) => void run('UPDATE folios SET voided = 1 WHERE id = ?', [Number(row.id)]),
    },
  ],
};

// ---------------------------------------------------------------------------

const tasks: ModuleDef = {
  key: 'tasks',
  from: 'tasks t JOIN rooms r ON r.id = t.room_id JOIN accounts a ON a.id = t.assignee_id',
  idColumn: 't.id',
  select: () => 't.id, t.date, r.number AS room, t.room_id, a.name AS assignee, t.assignee_id, t.kind, t.status',
  columns: [
    { key: 'room', type: 'text', sort: 'r.number', primary: true },
    { key: 'date', type: 'date', sort: 't.date' },
    { key: 'kind', type: 'option', set: 'taskKinds', sort: 't.kind' },
    { key: 'assignee', type: 'text', sort: 'a.name' },
    { key: 'status', type: 'status', set: 'tasks', sort: 't.status' },
  ],
  defaultSort: 'room.asc',
  filters: [
    { key: 'status', kind: 'select', set: 'tasks', options: OPTIONS.taskStatuses, apply: oneOf('t.status', OPTIONS.taskStatuses) },
    { key: 'kind', kind: 'select', set: 'taskKinds', options: OPTIONS.taskKinds, apply: oneOf('t.kind', OPTIONS.taskKinds) },
    { key: 'date', kind: 'date', apply: dateIs('t.date') },
  ],
  defaults: { when: ['date'], values: { date: 'today' } },
  // Housekeeping sees the tasks assigned to them, today, and nothing else.
  scope: (ctx) =>
    ctx.role === 'housekeeping' ? { sql: 't.assignee_id = ? AND t.date = ?', params: [ctx.account.id, ctx.today] } : null,
  label: (row) => ({ room: String(row.room) }),
  detail: ['room', 'date', 'kind', 'assignee', 'status'],
  create: {
    fields: [
      { key: 'roomId', kind: 'select', required: true, source: 'rooms' },
      { key: 'assigneeId', kind: 'select', required: true, source: 'housekeepers' },
      { key: 'date', kind: 'date', required: true },
      { key: 'kind', kind: 'select', required: true, options: OPTIONS.taskKinds },
    ],
    run: (_ctx, values) =>
      run("INSERT INTO tasks (room_id, assignee_id, date, kind, status) VALUES (?, ?, ?, ?, 'todo')", [
        Number(values.roomId),
        Number(values.assigneeId),
        values.date as string,
        values.kind as string,
      ]).lastId,
  },
  update: {
    fields: [
      { key: 'assigneeId', kind: 'select', required: true, source: 'housekeepers' },
      { key: 'date', kind: 'date', required: true },
      { key: 'kind', kind: 'select', required: true, options: OPTIONS.taskKinds },
    ],
    when: (row) => row.status === 'todo',
    run: (_ctx, row, values) => {
      if (row.status !== 'todo') throw new HttpError(409, 'state');
      run('UPDATE tasks SET assignee_id = ?, date = ?, kind = ? WHERE id = ?', [
        Number(values.assigneeId),
        values.date as string,
        values.kind as string,
        Number(row.id),
      ]);
    },
  },
  actions: [
    {
      key: 'start',
      grant: 'start',
      when: (row) => row.status === 'todo',
      run: (_ctx, row) => {
        run("UPDATE tasks SET status = 'inProgress' WHERE id = ?", [Number(row.id)]);
        run("UPDATE rooms SET status = 'cleaning' WHERE id = ? AND status = 'dirty'", [Number(row.room_id)]);
      },
    },
    {
      key: 'finish',
      grant: 'finish',
      when: (row) => row.status === 'inProgress',
      run: (_ctx, row) => {
        run("UPDATE tasks SET status = 'done' WHERE id = ?", [Number(row.id)]);
        run("UPDATE rooms SET status = 'available' WHERE id = ? AND status IN ('dirty','cleaning')", [Number(row.room_id)]);
      },
    },
  ],
};

// ---------------------------------------------------------------------------

const items: ModuleDef = {
  key: 'items',
  from: 'items i LEFT JOIN suppliers su ON su.id = i.supplier_id',
  idColumn: 'i.id',
  select: () =>
    `i.id, i.name, i.store, i.unit, i.quantity, i.threshold, i.unit_cost, su.name AS supplier, i.supplier_id,
     CASE WHEN i.quantity <= i.threshold THEN 'low' ELSE 'ok' END AS level`,
  columns: [
    { key: 'name', type: 'text', sort: 'i.name COLLATE NOCASE', primary: true },
    { key: 'store', type: 'option', set: 'stores', sort: 'i.store' },
    { key: 'quantity', type: 'number', sort: 'i.quantity' },
    { key: 'threshold', type: 'number', sort: 'i.threshold' },
    { key: 'unit', type: 'text' },
    { key: 'unit_cost', type: 'money', sort: 'i.unit_cost' },
    { key: 'level', type: 'status', set: 'items' },
  ],
  defaultSort: 'name.asc',
  filters: [
    { key: 'store', kind: 'select', set: 'stores', options: OPTIONS.stores, apply: oneOf('i.store', OPTIONS.stores) },
    {
      key: 'level',
      kind: 'select',
      set: 'items',
      options: OPTIONS.levels,
      apply: (value) =>
        value === 'low'
          ? { sql: 'i.quantity <= i.threshold', params: [] }
          : value === 'ok'
            ? { sql: 'i.quantity > i.threshold', params: [] }
            : null,
    },
    { key: 'q', kind: 'search', apply: prefix('i.name') },
  ],
  label: (row) => ({ item: String(row.name) }),
  detail: ['name', 'store', 'quantity', 'threshold', 'unit', 'unit_cost', 'supplier', 'level'],
  create: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'store', kind: 'select', required: true, options: OPTIONS.stores },
      { key: 'unit', kind: 'text', required: true, max: 20 },
      { key: 'threshold', kind: 'int', required: true, min: 0, max: 100000 },
      { key: 'unitCost', kind: 'money', required: true, min: 0 },
      { key: 'supplierId', kind: 'select', source: 'suppliers' },
    ],
    run: (_ctx, values) =>
      run('INSERT INTO items (name, store, unit, quantity, threshold, unit_cost, supplier_id) VALUES (?, ?, ?, 0, ?, ?, ?)', [
        values.name as string,
        values.store as string,
        values.unit as string,
        values.threshold as number,
        values.unitCost as number,
        values.supplierId ? Number(values.supplierId) : null,
      ]).lastId,
  },
  update: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'unit', kind: 'text', required: true, max: 20 },
      { key: 'threshold', kind: 'int', required: true, min: 0, max: 100000 },
      { key: 'unitCost', kind: 'money', required: true, min: 0 },
      { key: 'supplierId', kind: 'select', source: 'suppliers' },
    ],
    run: (_ctx, row, values) =>
      void run('UPDATE items SET name = ?, unit = ?, threshold = ?, unit_cost = ?, supplier_id = ? WHERE id = ?', [
        values.name as string,
        values.unit as string,
        values.threshold as number,
        values.unitCost as number,
        values.supplierId ? Number(values.supplierId) : null,
        Number(row.id),
      ]),
  },
  actions: [],
};

// ---------------------------------------------------------------------------

const movements: ModuleDef = {
  key: 'movements',
  from: 'movements m JOIN items i ON i.id = m.item_id LEFT JOIN accounts a ON a.id = m.author_id',
  idColumn: 'm.id',
  select: () =>
    'm.id, m.at, i.name AS item, m.item_id, m.kind, m.quantity, i.unit, m.from_store, m.to_store, m.reason, a.name AS author',
  columns: [
    { key: 'at', type: 'datetime', sort: 'm.at', primary: true },
    { key: 'item', type: 'text' },
    { key: 'kind', type: 'option', set: 'movementKinds', sort: 'm.kind' },
    { key: 'quantity', type: 'number', sort: 'm.quantity' },
    { key: 'from_store', type: 'option', set: 'stores' },
    { key: 'to_store', type: 'option', set: 'stores' },
    { key: 'author', type: 'text' },
  ],
  defaultSort: 'at.desc',
  filters: [
    { key: 'kind', kind: 'select', set: 'movementKinds', options: OPTIONS.movementKinds, apply: oneOf('m.kind', OPTIONS.movementKinds) },
    { key: 'from', kind: 'date', apply: (value, ctx) => dateFrom('m.at')(value, ctx) },
    {
      key: 'to',
      kind: 'date',
      apply: (value, ctx) => {
        const date = value === 'today' ? ctx.today : value;
        return isDate(date) ? { sql: 'm.at < ?', params: [addDays(date, 1)] } : null;
      },
    },
    { key: 'itemId', kind: 'search', hidden: true, apply: (value) => (/^\d+$/.test(value) ? { sql: 'm.item_id = ?', params: [Number(value)] } : null) },
  ],
  label: (row) => ({ item: String(row.item) }),
  detail: ['at', 'item', 'kind', 'quantity', 'unit', 'from_store', 'to_store', 'reason', 'author'],
  create: {
    fields: [
      { key: 'itemId', kind: 'select', required: true, source: 'items' },
      { key: 'kind', kind: 'select', required: true, options: OPTIONS.movementKinds },
      { key: 'quantity', kind: 'int', required: true, min: 1, max: 100000 },
      { key: 'toStore', kind: 'select', options: OPTIONS.stores },
      { key: 'reason', kind: 'text', max: 200 },
    ],
    // Quantity never below zero is a CHECK on items: an "out" larger than the
    // stock fails in the database and answers 409, whoever got there first.
    run: (ctx, values) => {
      const item = get('SELECT id, name, store, unit FROM items WHERE id = ?', [Number(values.itemId)]);
      if (!item) throw new HttpError(422, 'invalid', 'itemId');
      const quantity = values.quantity as number;
      const kind = values.kind as string;
      let from: string | null = null;
      let to: string | null = null;
      if (kind === 'in') {
        to = String(item.store);
        run('UPDATE items SET quantity = quantity + ? WHERE id = ?', [quantity, Number(item.id)]);
      } else if (kind === 'out') {
        from = String(item.store);
        run('UPDATE items SET quantity = quantity - ? WHERE id = ?', [quantity, Number(item.id)]);
      } else {
        to = values.toStore as string | null;
        if (!to || to === item.store) throw new HttpError(422, 'invalid', 'toStore');
        const twin = get('SELECT id FROM items WHERE name = ? AND store = ?', [String(item.name), to]);
        if (!twin) throw new HttpError(422, 'noTwin', 'toStore');
        from = String(item.store);
        run('UPDATE items SET quantity = quantity - ? WHERE id = ?', [quantity, Number(item.id)]);
        run('UPDATE items SET quantity = quantity + ? WHERE id = ?', [quantity, Number(twin.id)]);
      }
      return run(
        'INSERT INTO movements (item_id, kind, quantity, from_store, to_store, reason, author_id, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [Number(item.id), kind, quantity, from, to, values.reason as string | null, ctx.account.id, now()],
      ).lastId;
    },
  },
  actions: [],
};

// ---------------------------------------------------------------------------

const suppliers: ModuleDef = {
  key: 'suppliers',
  from: 'suppliers su',
  idColumn: 'su.id',
  select: () =>
    'su.id, su.name, su.contact, su.items_supplied, (SELECT COUNT(*) FROM items i WHERE i.supplier_id = su.id) AS item_count',
  columns: [
    { key: 'name', type: 'text', sort: 'su.name COLLATE NOCASE', primary: true },
    { key: 'contact', type: 'text' },
    { key: 'items_supplied', type: 'text' },
    { key: 'item_count', type: 'number' },
  ],
  defaultSort: 'name.asc',
  filters: [{ key: 'q', kind: 'search', apply: prefix('su.name') }],
  label: (row) => ({ supplier: String(row.name) }),
  detail: ['name', 'contact', 'items_supplied', 'item_count'],
  create: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'contact', kind: 'text', max: 160 },
      { key: 'itemsSupplied', kind: 'text', max: 200 },
    ],
    run: (_ctx, values) =>
      run('INSERT INTO suppliers (name, contact, items_supplied) VALUES (?, ?, ?)', [
        values.name as string,
        values.contact as string | null,
        values.itemsSupplied as string | null,
      ]).lastId,
  },
  update: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'contact', kind: 'text', max: 160 },
      { key: 'itemsSupplied', kind: 'text', max: 200 },
    ],
    run: (_ctx, row, values) =>
      void run('UPDATE suppliers SET name = ?, contact = ?, items_supplied = ? WHERE id = ?', [
        values.name as string,
        values.contact as string | null,
        values.itemsSupplied as string | null,
        Number(row.id),
      ]),
  },
  actions: [],
};

// ---------------------------------------------------------------------------

const ledger: ModuleDef = {
  key: 'ledger',
  from: 'ledger l LEFT JOIN accounts a ON a.id = l.author_id LEFT JOIN folios f ON f.id = l.folio_id',
  idColumn: 'l.id',
  select: () =>
    `l.id, l.date, l.kind, l.category, l.amount,
     CASE WHEN l.reverses_id IS NULL THEN l.amount ELSE -l.amount END AS signed, l.method, f.number AS folio,
     l.reverses_id, (SELECT x.id FROM ledger x WHERE x.reverses_id = l.id) AS reversed_by, a.name AS author,
     CASE WHEN l.reverses_id IS NOT NULL THEN 'reversal'
          WHEN EXISTS (SELECT 1 FROM ledger x WHERE x.reverses_id = l.id) THEN 'reversed' ELSE 'posted' END AS state`,
  columns: [
    { key: 'date', type: 'date', sort: 'l.date', primary: true },
    { key: 'kind', type: 'option', set: 'ledgerKinds', sort: 'l.kind' },
    { key: 'category', type: 'option', set: 'categories', sort: 'l.category' },
    { key: 'signed', type: 'money', sort: 'l.amount' },
    { key: 'method', type: 'option', set: 'methods' },
    { key: 'folio', type: 'text' },
    { key: 'state', type: 'status', set: 'ledger' },
  ],
  defaultSort: 'date.desc',
  filters: [
    { key: 'kind', kind: 'select', set: 'ledgerKinds', options: OPTIONS.ledgerKinds, apply: oneOf('l.kind', OPTIONS.ledgerKinds) },
    { key: 'category', kind: 'select', set: 'categories', options: OPTIONS.categories, apply: oneOf('l.category', OPTIONS.categories) },
    { key: 'period', kind: 'select', set: 'periods', options: OPTIONS.periods, apply: periodWhere('l.date') },
    { key: 'from', kind: 'date', apply: dateFrom('l.date') },
    { key: 'to', kind: 'date', apply: dateTo('l.date') },
  ],
  sum: 'CASE WHEN l.reverses_id IS NULL THEN l.amount ELSE -l.amount END',
  label: (row) => ({ date: String(row.date), category: String(row.category) }),
  detail: ['date', 'kind', 'category', 'signed', 'method', 'folio', 'author', 'state'],
  create: {
    fields: [
      { key: 'kind', kind: 'select', required: true, options: OPTIONS.ledgerKinds },
      { key: 'category', kind: 'select', required: true, options: OPTIONS.categories },
      { key: 'amount', kind: 'money', required: true, min: 1 },
      { key: 'method', kind: 'select', required: true, options: OPTIONS.methods },
      { key: 'date', kind: 'date', required: true },
    ],
    run: (ctx, values) => {
      if ((values.date as string) > ctx.today) throw new HttpError(422, 'future', 'date');
      return run(
        'INSERT INTO ledger (kind, category, amount, method, date, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [values.kind as string, values.category as string, values.amount as number, values.method as string, values.date as string, ctx.account.id, now()],
      ).lastId;
    },
  },
  actions: [
    {
      key: 'reverse',
      grant: 'reverse',
      destructive: true,
      when: (row) => row.reverses_id === null && row.reversed_by === null,
      // A correction is a reversing entry pointing at the one it reverses. The
      // UNIQUE constraint on reverses_id refuses a second reversal even when
      // two requests race.
      run: (ctx, row) => {
        const original = get('SELECT kind, category, amount, method FROM ledger WHERE id = ?', [Number(row.id)])!;
        run(
          'INSERT INTO ledger (kind, category, amount, method, date, author_id, reverses_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [String(original.kind), String(original.category), Number(original.amount), String(original.method), ctx.today, ctx.account.id, Number(row.id), now()],
        );
      },
    },
  ],
};

// ---------------------------------------------------------------------------

const staff: ModuleDef = {
  key: 'staff',
  from: 'accounts a',
  idColumn: 'a.id',
  select: () =>
    "a.id, a.name, a.email, a.role, CASE WHEN a.active = 1 THEN 'active' ELSE 'inactive' END AS activity, a.created_at",
  columns: [
    { key: 'name', type: 'text', sort: 'a.name COLLATE NOCASE', primary: true },
    { key: 'email', type: 'text', sort: 'a.email' },
    { key: 'role', type: 'option', set: 'roles', sort: 'a.role' },
    { key: 'activity', type: 'status', set: 'staff', sort: 'a.active' },
  ],
  defaultSort: 'name.asc',
  filters: [
    { key: 'role', kind: 'select', set: 'roles', options: ROLE_KEYS, apply: oneOf('a.role', ROLE_KEYS) },
    {
      key: 'activity',
      kind: 'select',
      set: 'staff',
      options: OPTIONS.activity,
      apply: (value) => (value === 'active' || value === 'inactive' ? { sql: 'a.active = ?', params: [value === 'active' ? 1 : 0] } : null),
    },
  ],
  label: (row) => ({ name: String(row.name) }),
  detail: ['name', 'email', 'role', 'activity', 'created_at'],
  // An account is created without a password. Its owner sets one through a
  // single use link the creating manager hands over (app/api/staff/route.ts).
  create: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'email', kind: 'email', required: true },
      { key: 'role', kind: 'select', required: true, options: ROLE_KEYS },
    ],
    run: (_ctx, values) => {
      if (get('SELECT id FROM accounts WHERE email = ?', [values.email as string])) {
        throw new HttpError(422, 'taken', 'email');
      }
      return run('INSERT INTO accounts (name, email, role, active, created_at) VALUES (?, ?, ?, 1, ?)', [
        values.name as string,
        values.email as string,
        values.role as string,
        now(),
      ]).lastId;
    },
  },
  update: {
    fields: [
      { key: 'name', kind: 'text', required: true, max: 120 },
      { key: 'email', kind: 'email', required: true },
    ],
    run: (_ctx, row, values) =>
      void run('UPDATE accounts SET name = ?, email = ? WHERE id = ?', [values.name as string, values.email as string, Number(row.id)]),
  },
  actions: [
    {
      key: 'deactivate',
      grant: 'deactivate',
      destructive: true,
      when: (row, ctx) => row.activity === 'active' && Number(row.id) !== ctx.account.id,
      run: (ctx, row) => {
        if (Number(row.id) === ctx.account.id) throw new HttpError(409, 'self');
        run('UPDATE accounts SET active = 0 WHERE id = ?', [Number(row.id)]);
        run('DELETE FROM sessions WHERE account_id = ?', [Number(row.id)]);
      },
    },
    {
      key: 'reactivate',
      grant: 'reactivate',
      when: (row) => row.activity === 'inactive',
      run: (_ctx, row) => void run('UPDATE accounts SET active = 1 WHERE id = ?', [Number(row.id)]),
    },
    {
      key: 'changeRole',
      grant: 'changeRole',
      when: (row, ctx) => Number(row.id) !== ctx.account.id,
      fields: [{ key: 'role', kind: 'select', required: true, options: ROLE_KEYS }],
      run: (ctx, row, values) => {
        if (Number(row.id) === ctx.account.id) throw new HttpError(409, 'self');
        run('UPDATE accounts SET role = ? WHERE id = ?', [values.role as string, Number(row.id)]);
      },
    },
  ],
};

// ---------------------------------------------------------------------------

const audit: ModuleDef = {
  key: 'audit',
  from: 'audit au LEFT JOIN accounts a ON a.id = au.account_id',
  idColumn: 'au.id',
  select: () => 'au.id, au.at, a.name AS account, au.role, au.action, au.module, au.record, au.outcome, au.status, au.address',
  columns: [
    { key: 'at', type: 'datetime', sort: 'au.at', primary: true },
    { key: 'account', type: 'text' },
    { key: 'role', type: 'option', set: 'roles' },
    { key: 'action', type: 'text' },
    { key: 'record', type: 'text' },
    { key: 'outcome', type: 'status', set: 'audit' },
  ],
  defaultSort: 'at.desc',
  filters: [
    { key: 'outcome', kind: 'select', set: 'audit', options: OPTIONS.outcomes, apply: oneOf('au.outcome', OPTIONS.outcomes) },
    { key: 'from', kind: 'date', apply: dateFrom('au.at') },
    {
      key: 'to',
      kind: 'date',
      apply: (value, ctx) => {
        const date = value === 'today' ? ctx.today : value;
        return isDate(date) ? { sql: 'au.at < ?', params: [addDays(date, 1)] } : null;
      },
    },
  ],
  label: (row) => ({ action: String(row.action) }),
  detail: ['at', 'account', 'role', 'action', 'module', 'record', 'outcome', 'status', 'address'],
  actions: [],
};

export const DEFINITIONS: Partial<Record<ModuleKey, ModuleDef>> = {
  rooms,
  stays,
  guests,
  folios,
  tasks,
  items,
  movements,
  suppliers,
  ledger,
  staff,
  audit,
};

export function definition(key: string): ModuleDef | null {
  return (DEFINITIONS as Record<string, ModuleDef | undefined>)[key] ?? null;
}

// The values a select field accepts when its options come from the database.
export function sourceOptions(fields: FieldDef[]): Record<string, { value: string; label: string }[]> {
  const out: Record<string, { value: string; label: string }[]> = {};
  for (const field of fields) {
    if (!field.source) continue;
    let rows: Row[] = [];
    if (field.source === 'rooms') rows = all('SELECT id AS value, number AS label FROM rooms ORDER BY number');
    if (field.source === 'housekeepers') {
      rows = all("SELECT id AS value, name AS label FROM accounts WHERE role = 'housekeeping' AND active = 1 ORDER BY name");
    }
    if (field.source === 'suppliers') rows = all('SELECT id AS value, name AS label FROM suppliers ORDER BY name');
    if (field.source === 'items') {
      rows = all("SELECT id AS value, name || ' (' || store || ')' AS label FROM items ORDER BY name, store");
    }
    out[field.key] = rows.map((row) => ({ value: String(row.value), label: String(row.label) }));
  }
  return out;
}

export function sourceValues(fields: FieldDef[]): Record<string, string[]> {
  const options = sourceOptions(fields);
  return Object.fromEntries(Object.entries(options).map(([key, list]) => [key, list.map((option) => option.value)]));
}

export { tx };
