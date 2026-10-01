// Seeds a demonstration database with twelve months of fictional records, from
// a fixed seed: two runs with the same anchor date produce the same records,
// so the gate's figures can be compared from one run to the next.
//
//   npm run seed                          anchor: today in the hotel's zone
//   npm run seed -- --today 2026-10-01    anchor: a fixed date
//   npm run seed -- --reset               delete the database first
//
// Every name is built from invented syllables, every email address uses the
// reserved example.test domain, every telephone number the range reserved for
// fiction. The database is marked as a demonstration, which puts a banner on
// every screen. The script refuses to run with HOTEL_ENV=production, and
// refuses to write into a database that holds records it did not create.
//
// Account passwords: with SEED_PASSWORD set (at least 12 characters), every
// seeded account gets it, for review and for the gate. Without it, each
// account gets a single use setup link, printed once.
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword, MINIMUM_LENGTH } from '../lib/password.mjs';
import { SCHEMA } from '../lib/schema.mjs';

if (process.env.HOTEL_ENV === 'production') {
  console.error('Refused: HOTEL_ENV is production. Fictional records are never written into a live instance.');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(dataDir, { recursive: true });
const config = JSON.parse(readFileSync(join(dataDir, 'content.json'), 'utf8'));
const timeZone = config.site.timeZone;
const anchor =
  option('--today') ??
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(anchor)) {
  console.error('--today takes a date written YYYY-MM-DD');
  process.exit(1);
}

const file = join(dataDir, 'hotel.db');
if (flag('--reset')) {
  for (const suffix of ['', '-wal', '-shm']) rmSync(`${file}${suffix}`, { force: true });
}
const db = new DatabaseSync(file);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(SCHEMA);
const existing = Number(db.prepare('SELECT COUNT(*) AS c FROM stays').get().c);
const demo = db.prepare("SELECT value FROM meta WHERE key = 'demo'").get();
if (existing > 0 && demo?.value !== '1') {
  console.error('Refused: this database holds records the seed did not create.');
  process.exit(1);
}
if (existing > 0) {
  console.error('This database is already seeded. Run with --reset to start again.');
  process.exit(1);
}

const password = process.env.SEED_PASSWORD;
if (password !== undefined && password.length < MINIMUM_LENGTH) {
  console.error(`SEED_PASSWORD needs at least ${MINIMUM_LENGTH} characters.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// A small deterministic generator (mulberry32). Same seed, same records.

let state = 0x5eed2026;
function random() {
  state |= 0;
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const chance = (p) => random() < p;

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
const nights = (a, d) => Math.round((Date.parse(`${d}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
const at = (date, hour, minute = 0) => `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;

// Invented syllables: no name below belongs to anyone.
const ONSETS = ['b', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'br', 'cl', 'dr', 'gr', 'pl', 'tr', 'vr'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'ai', 'eo', 'ia', 'ou'];
const CODAS = ['', '', 'n', 'l', 'r', 's', 'x', 'nd', 'rt'];
function word(syllables) {
  let text = '';
  for (let index = 0; index < syllables; index++) text += pick(ONSETS) + pick(VOWELS) + (index === syllables - 1 ? pick(CODAS) : '');
  return text[0].toUpperCase() + text.slice(1);
}
const personName = () => `${word(int(2, 3))} ${word(int(2, 3))}`;
const slug = (text) => text.toLowerCase().replace(/[^a-z]+/g, '.');
// The French range reserved for fiction: 01 99 00 xx xx.
const phone = () => `+33 1 99 00 ${String(int(0, 99)).padStart(2, '0')} ${String(int(0, 99)).padStart(2, '0')}`;

const start = addDays(anchor, -365);
const horizon = addDays(anchor, 45);
const created = at(start, 8);

const insert = (sql) => db.prepare(sql);
db.exec('BEGIN');

// ---------------------------------------------------------------------------
// Accounts: one per role, plus a deactivated one.

const ROLES = ['manager', 'frontDesk', 'housekeeping', 'storekeeper', 'bookkeeper'];
const accountRows = [];
const addAccount = insert('INSERT INTO accounts (name, email, role, active, salt, hash, params, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const seededAccounts = [...ROLES.map((role) => ({ role, active: 1 })), { role: 'housekeeping', active: 0 }];
for (const account of seededAccounts) {
  const name = personName();
  const email = `${slug(name)}@example.test`;
  const hashed = password ? await hashPassword(password) : { salt: null, hash: null, params: null };
  const result = addAccount.run(name, email, account.role, account.active, hashed.salt, hashed.hash, hashed.params, created);
  accountRows.push({ id: Number(result.lastInsertRowid), name, email, role: account.role, active: account.active });
}
const byRole = (role) => accountRows.find((account) => account.role === role && account.active === 1);
const housekeeper = byRole('housekeeping');
const formerHousekeeper = accountRows.find((account) => account.active === 0);

// ---------------------------------------------------------------------------
// Rooms: thirty two, numbered 01 to 32 over four floors.

const RATES = { single: 7400, double: 9600, twin: 9800, family: 13800 };
const roomRows = [];
const addRoom = insert('INSERT INTO rooms (number, type, floor, nightly_rate, status) VALUES (?, ?, ?, ?, ?)');
for (let index = 1; index <= 32; index++) {
  const type = index % 8 === 0 ? 'family' : index % 5 === 0 ? 'single' : index % 3 === 0 ? 'twin' : 'double';
  const number = String(index).padStart(2, '0');
  const result = addRoom.run(number, type, Math.ceil(index / 8), RATES[type], 'available');
  roomRows.push({ id: Number(result.lastInsertRowid), number, type, rate: RATES[type] });
}

// ---------------------------------------------------------------------------
// Guests: about three thousand.

const NOTES = [
  'Prefers a room away from the lift.',
  'Arrives late, keep the key at the desk.',
  'Asked for extra pillows last time.',
  'Allergic to feather duvets.',
  'Travels with a small dog.',
];
const guestRows = [];
const addGuest = insert('INSERT INTO guests (name, email, phone, notes, created_at, created_by_role) VALUES (?, ?, ?, ?, ?, ?)');
for (let index = 0; index < 3000; index++) {
  const name = personName();
  const email = chance(0.6) ? `${slug(name)}.${index}@example.test` : null;
  const result = addGuest.run(name, email, chance(0.5) ? phone() : null, chance(0.06) ? pick(NOTES) : null, created, chance(0.8) ? 'frontDesk' : 'manager');
  guestRows.push(Number(result.lastInsertRowid));
}

// ---------------------------------------------------------------------------
// Stays: walk each room's calendar from a year ago to six weeks ahead. One
// stay never overlaps another active stay in the same room.

const stays = [];
let guestCursor = 0;
const nextGuest = () => (guestCursor < guestRows.length && chance(0.75) ? guestRows[guestCursor++] : pick(guestRows));
for (const room of roomRows) {
  let day = addDays(start, int(0, 3));
  let previous = null;
  while (day < horizon) {
    const length = pick([1, 1, 1, 2, 2, 2, 3, 3, 4, 6]);
    const arrival = day;
    const departure = addDays(arrival, length);
    let status;
    if (departure < anchor) status = 'departed';
    else if (arrival < anchor) status = departure === anchor && chance(0.55) ? 'departed' : 'inHouse';
    // A guest still in the room this morning means the next one cannot be in yet.
    else if (arrival === anchor) status = previous?.status !== 'inHouse' && chance(0.35) ? 'inHouse' : 'confirmed';
    else status = chance(0.12) ? 'provisional' : 'confirmed';
    previous = { room, guest: nextGuest(), arrival, departure, status, adults: room.type === 'single' ? 1 : int(1, 2), children: room.type === 'family' ? int(0, 2) : 0 };
    stays.push(previous);
    day = addDays(departure, pick([0, 0, 0, 0, 1, 1, 2]));
  }
}
// Cancellations do not hold a room, so they may sit anywhere.
for (let index = 0; index < 180; index++) {
  const room = pick(roomRows);
  const arrival = addDays(start, int(0, 400));
  stays.push({ room, guest: pick(guestRows), arrival, departure: addDays(arrival, int(1, 4)), status: 'cancelled', adults: 1, children: 0 });
}
stays.sort((a, b) => (a.arrival === b.arrival ? a.room.number.localeCompare(b.room.number) : a.arrival.localeCompare(b.arrival)));

const addStay = insert(
  `INSERT INTO stays (room_id, guest_id, arrival, departure, adults, children, status, rate, total, created_by, idempotency_key, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);
const desk = byRole('frontDesk');
for (const [index, stay] of stays.entries()) {
  const total = stay.room.rate * nights(stay.arrival, stay.departure);
  const result = addStay.run(stay.room.id, stay.guest, stay.arrival, stay.departure, stay.adults, stay.children, stay.status, stay.room.rate, total, desk.id, `seed-${index}`, at(addDays(stay.arrival, -int(1, 40)), 10));
  stay.id = Number(result.lastInsertRowid);
  stay.total = total;
}
db.exec(`UPDATE guests SET last_stay_at = (SELECT MAX(arrival) FROM stays WHERE stays.guest_id = guests.id AND stays.status <> 'cancelled')`);

// ---------------------------------------------------------------------------
// Folios and payments. A folio opens at check in. Older departures are paid;
// a few recent ones are not, and some of those are overdue.

const addFolio = insert('INSERT INTO folios (stay_id, year, seq, number, total, paid, due_date, voided, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)');
const addLine = insert('INSERT INTO folio_lines (folio_id, label, quantity, unit_amount) VALUES (?, ?, ?, ?)');
const addEntry = insert(
  'INSERT INTO ledger (kind, category, amount, method, date, folio_id, author_id, reverses_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
);
const sequence = {};
const ledger = [];
const METHODS = ['card', 'card', 'card', 'cash', 'transfer'];
for (const stay of stays) {
  if (stay.status !== 'inHouse' && stay.status !== 'departed') continue;
  const year = Number(stay.arrival.slice(0, 4));
  sequence[year] = (sequence[year] ?? 0) + 1;
  const number = `${year}-${String(sequence[year]).padStart(5, '0')}`;
  let paid = stay.total;
  if (stay.status === 'inHouse') paid = chance(0.3) ? stay.room.rate : 0;
  else if (stay.departure >= addDays(anchor, -45) && chance(0.07)) paid = chance(0.5) ? 0 : Math.floor(stay.total / 2);
  else if (chance(0.002)) paid = 0;
  const result = addFolio.run(stay.id, year, sequence[year], number, stay.total, paid, addDays(stay.departure, 14), at(stay.arrival, 15));
  const folio = Number(result.lastInsertRowid);
  addLine.run(folio, 'room', nights(stay.arrival, stay.departure), stay.room.rate);
  if (paid > 0) {
    const day = stay.status === 'inHouse' ? stay.arrival : stay.departure;
    ledger.push(['income', 'rooms', paid, pick(METHODS), day > anchor ? anchor : day, folio, desk.id, null, at(day > anchor ? anchor : day, 11)]);
  }
}

// Bar and kitchen takings, and the expenses of running the house.
const books = byRole('bookkeeper');
for (let day = start; day <= anchor; day = addDays(day, 1)) {
  // Bar and kitchen takings are recorded per service and per method.
  for (let index = 0; index < int(3, 5); index++) ledger.push(['income', 'bar', int(3000, 18000), pick(METHODS), day, null, books.id, null, at(day, 22)]);
  for (let index = 0; index < int(3, 5); index++) ledger.push(['income', 'kitchen', int(4000, 24000), pick(METHODS), day, null, books.id, null, at(day, 21)]);
  for (let index = 0; index < int(3, 7); index++) ledger.push(['expense', 'supplies', int(1500, 32000), pick(['card', 'transfer']), day, null, books.id, null, at(day, 9)]);
  if (chance(0.5)) ledger.push(['expense', 'maintenance', int(3000, 60000), 'transfer', day, null, books.id, null, at(day, 14)]);
  if (day.endsWith('-01')) {
    for (let index = 0; index < 6; index++) ledger.push(['expense', 'wages', int(180000, 260000), 'transfer', day, null, books.id, null, at(day, 8)]);
    ledger.push(['expense', 'utilities', int(90000, 160000), 'transfer', day, null, books.id, null, at(day, 8)]);
  }
  if (chance(0.5)) ledger.push(['income', 'other', int(1500, 9000), 'cash', day, null, books.id, null, at(day, 16)]);
}
ledger.sort((a, b) => (a[4] === b[4] ? a[8].localeCompare(b[8]) : a[4].localeCompare(b[4])));
const ledgerIds = [];
for (const entry of ledger) ledgerIds.push({ id: Number(addEntry.run(...entry).lastInsertRowid), entry });
// A few corrections: a reversing entry pointing at the one it reverses.
for (let index = 0; index < 24; index++) {
  const target = ledgerIds[int(0, ledgerIds.length - 1)];
  if (target.reversed || target.entry[5]) continue;
  target.reversed = true;
  const [kind, category, amount, method, date] = target.entry;
  const when = addDays(date, int(0, 3)) > anchor ? anchor : addDays(date, int(0, 3));
  addEntry.run(kind, category, amount, method, when, null, books.id, target.id, at(when, 17));
}

// ---------------------------------------------------------------------------
// Suppliers, items and a year of movements that keep every quantity at zero
// or above, as the database requires.

const supplierIds = [];
const addSupplier = insert('INSERT INTO suppliers (name, contact, items_supplied) VALUES (?, ?, ?)');
const SUPPLIES = ['drinks', 'dry goods', 'fresh produce', 'dairy', 'linen', 'cleaning products', 'paper goods'];
for (let index = 0; index < 16; index++) {
  const name = `${word(2)} ${pick(['Distribution', 'Supplies', 'Trading', 'Provisions'])}`;
  supplierIds.push(Number(addSupplier.run(name, `orders.${index}@example.test`, pick(SUPPLIES)).lastInsertRowid));
}

const GOODS = {
  bar: ['Still water', 'Sparkling water', 'Orange juice', 'Apple juice', 'Tonic', 'Cola', 'Lemonade', 'House red', 'House white', 'Rose', 'Pale ale', 'Lager', 'Cider', 'Coffee beans', 'Tea', 'Syrup'],
  kitchen: ['Flour', 'Butter', 'Eggs', 'Milk', 'Cream', 'Rice', 'Pasta', 'Olive oil', 'Sugar', 'Salt', 'Tomatoes', 'Onions', 'Potatoes', 'Cheese', 'Yoghurt', 'Jam', 'Bread rolls', 'Still water', 'Sparkling water', 'Orange juice'],
  linen: ['Bath towel', 'Hand towel', 'Bath mat', 'Double sheet', 'Single sheet', 'Pillowcase', 'Duvet cover', 'Tea towel', 'Napkin', 'Tablecloth'],
};
const SIZES = {
  bar: ['20cl', '25cl', '33cl', '50cl', '75cl', '1l', '1.5l', '5l'],
  kitchen: ['250g', '500g', '1kg', '2kg', '5kg', '10kg', '1l', '2l'],
  linen: ['standard', 'large', 'small', 'white', 'grey', 'striped', 'blue', 'cream'],
};
const UNITS = { bar: 'bottle', kitchen: 'pack', linen: 'piece' };
const items = [];
const seen = new Set();
const addItem = insert('INSERT INTO items (name, store, unit, quantity, threshold, unit_cost, supplier_id) VALUES (?, ?, ?, 0, 0, ?, ?)');
// Twins first: the same product held in two stores, so a transfer has a destination.
for (const good of ['Still water', 'Sparkling water', 'Orange juice']) {
  for (const size of ['50cl', '1l']) {
    for (const store of ['bar', 'kitchen']) {
      const name = `${good} ${size}`;
      seen.add(`${store}:${name}`);
      items.push({ id: Number(addItem.run(name, store, UNITS[store], int(40, 400), pick(supplierIds)).lastInsertRowid), store, quantity: 0 });
    }
  }
}
// 128 bar, 160 kitchen and 80 linen combinations: enough room for 300.
while (items.length < 300) {
  const store = pick(['bar', 'bar', 'kitchen', 'kitchen', 'linen']);
  const name = `${pick(GOODS[store])} ${pick(SIZES[store])}`;
  if (seen.has(`${store}:${name}`)) continue;
  seen.add(`${store}:${name}`);
  items.push({ id: Number(addItem.run(name, store, UNITS[store], int(40, 2400), pick(supplierIds)).lastInsertRowid), store, quantity: 0 });
}

const movements = [];
for (const item of items) {
  let quantity = 0;
  let day = start;
  movements.push({ item, kind: 'in', quantity: int(30, 80), day, hour: 7 });
  quantity += movements[movements.length - 1].quantity;
  for (let index = 0; index < 64; index++) {
    day = addDays(day, int(3, 8));
    if (day > anchor) break;
    if (quantity < 15 || chance(0.25)) {
      const amount = int(20, 60);
      quantity += amount;
      movements.push({ item, kind: 'in', quantity: amount, day, hour: 8 });
    } else {
      const amount = int(1, Math.min(quantity, 12));
      quantity -= amount;
      movements.push({ item, kind: 'out', quantity: amount, day, hour: 18 });
    }
  }
  item.quantity = quantity;
}
movements.sort((a, b) => (a.day === b.day ? a.hour - b.hour : a.day.localeCompare(b.day)));
const addMovement = insert('INSERT INTO movements (item_id, kind, quantity, from_store, to_store, reason, author_id, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const keeper = byRole('storekeeper');
for (const [index, movement] of movements.entries()) {
  const { item } = movement;
  addMovement.run(
    item.id,
    movement.kind,
    movement.quantity,
    movement.kind === 'out' ? item.store : null,
    movement.kind === 'in' ? item.store : null,
    movement.kind === 'in' ? 'delivery' : 'used',
    keeper.id,
    at(movement.day, movement.hour, index % 60),
  );
}
// Fifteen items end at or below their threshold; the rest above it.
const setLevel = insert('UPDATE items SET quantity = ?, threshold = ? WHERE id = ?');
for (const [index, item] of items.entries()) {
  const low = index % 20 === 7;
  const threshold = low ? item.quantity + int(0, 6) : Math.max(0, Math.min(item.quantity - 1, int(5, 20)));
  setLevel.run(item.quantity, item.quantity === 0 && !low ? 0 : threshold, item.id);
}
// An item at zero that is not meant to be low still reads as low; top it up.
for (const item of items) {
  const row = db.prepare('SELECT quantity, threshold FROM items WHERE id = ?').get(item.id);
  if (Number(row.quantity) <= Number(row.threshold) && items.indexOf(item) % 20 !== 7) {
    addMovement.run(item.id, 'in', 30, null, item.store, 'delivery', keeper.id, at(anchor, 7));
    db.prepare('UPDATE items SET quantity = quantity + 30, threshold = ? WHERE id = ?').run(Math.min(Number(row.threshold), 10), item.id);
  }
}

// ---------------------------------------------------------------------------
// Rooms now, and housekeeping tasks: today's for the housekeeper, and the
// history of the last sixty days, part of it by the former housekeeper.

const setRoom = insert('UPDATE rooms SET status = ?, out_of_order_reason = ? WHERE id = ?');
const addTask = insert('INSERT INTO tasks (room_id, assignee_id, date, kind, status) VALUES (?, ?, ?, ?, ?)');
const tonight = new Set(stays.filter((stay) => stay.status === 'inHouse').map((stay) => stay.room.id));
const leftToday = stays.filter((stay) => stay.status === 'departed' && stay.departure === anchor).map((stay) => stay.room.id);
for (const room of roomRows) {
  if (tonight.has(room.id)) setRoom.run('occupied', null, room.id);
}
let planned = 0;
for (const roomId of leftToday) {
  if (tonight.has(roomId)) continue;
  const status = pick(['todo', 'todo', 'inProgress', 'done']);
  if (planned < 6) {
    addTask.run(roomId, housekeeper.id, anchor, 'departureClean', status);
    planned++;
    setRoom.run(status === 'done' ? 'available' : status === 'inProgress' ? 'cleaning' : 'dirty', null, roomId);
  } else {
    // Not yet planned: dirty, and outside the housekeeper's scope for now.
    setRoom.run('dirty', null, roomId);
  }
}
for (const roomId of [...tonight].slice(0, 5)) addTask.run(roomId, housekeeper.id, anchor, 'stayOver', 'todo');
const outOfOrder = roomRows.find((room) => !tonight.has(room.id) && !leftToday.includes(room.id) && room.number >= '20');
if (outOfOrder) setRoom.run('outOfOrder', 'Leak under the basin, plumber booked', outOfOrder.id);
for (let back = 60; back >= 1; back--) {
  const day = addDays(anchor, -back);
  for (let index = 0; index < int(4, 9); index++) {
    addTask.run(pick(roomRows).id, back > 20 ? formerHousekeeper.id : housekeeper.id, day, pick(['departureClean', 'departureClean', 'stayOver', 'deepClean']), 'done');
  }
}

for (const [key, value] of [
  ['demo', '1'],
  ['seedAnchor', anchor],
  ['seedVersion', '1'],
]) {
  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, value);
}
db.exec('COMMIT');

const count = (table) => Number(db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c);
console.log(`Seeded ${file}, anchored on ${anchor}:`);
for (const table of ['rooms', 'stays', 'guests', 'folios', 'items', 'movements', 'ledger', 'suppliers', 'tasks', 'accounts']) {
  console.log(`  ${table.padEnd(10)} ${count(table)}`);
}
console.log('Accounts (identifier, role):');
for (const account of accountRows) {
  console.log(`  ${account.email.padEnd(40)} ${account.role}${account.active ? '' : ' (deactivated)'}`);
}
if (!password) {
  console.log('No SEED_PASSWORD: each active account sets its password through a single use link, valid 72 hours:');
  const addToken = db.prepare('INSERT INTO setup_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)');
  for (const account of accountRows.filter((candidate) => candidate.active)) {
    const token = randomBytes(32).toString('hex');
    addToken.run(createHash('sha256').update(token).digest('hex'), account.id, Date.now() + 72 * 60 * 60_000);
    console.log(`  ${account.role.padEnd(13)} ${config.site.baseUrl}/setup?token=${token}`);
  }
}
db.close();
