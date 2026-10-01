// The database schema, in one place, read by the server (lib/db.ts) and by the
// operator scripts (seed, create-admin, backup, restore). Plain JavaScript so
// that both a Next.js route and `node scripts/...` can import it.
//
// Business rules live here, in the database, not only in a check before a
// write: two clerks clicking at once is the case they exist for.
//
//   no two active stays overlap in one room      triggers stay_overlap_*
//   departure after arrival                       CHECK on stays
//   stock never below zero                        CHECK on items.quantity
//   a payment never above the folio total         CHECK on folios.paid
//   movements, ledger and audit are append only   triggers *_append_only
//   folio numbers sequential per year             UNIQUE (year, seq)

export const ROLES = ['manager', 'frontDesk', 'housekeeping', 'storekeeper', 'bookkeeper'];

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('manager','frontDesk','housekeeping','storekeeper','bookkeeper')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  salt TEXT,
  hash TEXT,
  params TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  csrf TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  address TEXT
);
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);

CREATE TABLE IF NOT EXISTS setup_tokens (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  locked_until INTEGER
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('single','double','twin','family')),
  floor INTEGER NOT NULL CHECK (floor BETWEEN 0 AND 20),
  nightly_rate INTEGER NOT NULL CHECK (nightly_rate > 0),
  status TEXT NOT NULL CHECK (status IN ('available','occupied','dirty','cleaning','outOfOrder')),
  out_of_order_reason TEXT CHECK (out_of_order_reason IS NULL OR length(out_of_order_reason) <= 200)
);
CREATE INDEX IF NOT EXISTS rooms_status ON rooms(status);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email TEXT,
  phone TEXT,
  notes TEXT CHECK (notes IS NULL OR length(notes) <= 500),
  created_at TEXT NOT NULL,
  created_by_role TEXT,
  last_stay_at TEXT
);
CREATE INDEX IF NOT EXISTS guests_name ON guests(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS guests_last_stay ON guests(last_stay_at);

CREATE TABLE IF NOT EXISTS stays (
  id INTEGER PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  arrival TEXT NOT NULL,
  departure TEXT NOT NULL,
  adults INTEGER NOT NULL CHECK (adults BETWEEN 1 AND 8),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children BETWEEN 0 AND 8),
  status TEXT NOT NULL CHECK (status IN ('provisional','confirmed','inHouse','departed','cancelled')),
  rate INTEGER NOT NULL CHECK (rate > 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  created_by INTEGER REFERENCES accounts(id),
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  CHECK (departure > arrival)
);
CREATE INDEX IF NOT EXISTS stays_arrival ON stays(arrival, id);
CREATE INDEX IF NOT EXISTS stays_departure ON stays(departure, id);
CREATE INDEX IF NOT EXISTS stays_status_arrival ON stays(status, arrival);
CREATE INDEX IF NOT EXISTS stays_room_dates ON stays(room_id, arrival, departure);
CREATE INDEX IF NOT EXISTS stays_guest ON stays(guest_id);

CREATE TRIGGER IF NOT EXISTS stay_overlap_insert
BEFORE INSERT ON stays
WHEN NEW.status IN ('provisional','confirmed','inHouse')
BEGIN
  SELECT RAISE(ABORT, 'stay_overlap')
  WHERE EXISTS (
    SELECT 1 FROM stays s
    WHERE s.room_id = NEW.room_id
      AND s.status IN ('provisional','confirmed','inHouse')
      AND s.arrival < NEW.departure AND NEW.arrival < s.departure
  );
END;

CREATE TRIGGER IF NOT EXISTS stay_overlap_update
BEFORE UPDATE OF room_id, arrival, departure, status ON stays
WHEN NEW.status IN ('provisional','confirmed','inHouse')
BEGIN
  SELECT RAISE(ABORT, 'stay_overlap')
  WHERE EXISTS (
    SELECT 1 FROM stays s
    WHERE s.id <> NEW.id
      AND s.room_id = NEW.room_id
      AND s.status IN ('provisional','confirmed','inHouse')
      AND s.arrival < NEW.departure AND NEW.arrival < s.departure
  );
END;

CREATE TABLE IF NOT EXISTS folios (
  id INTEGER PRIMARY KEY,
  stay_id INTEGER NOT NULL UNIQUE REFERENCES stays(id),
  year INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  number TEXT NOT NULL UNIQUE,
  total INTEGER NOT NULL CHECK (total >= 0),
  paid INTEGER NOT NULL DEFAULT 0 CHECK (paid >= 0 AND paid <= total),
  due_date TEXT NOT NULL,
  voided INTEGER NOT NULL DEFAULT 0 CHECK (voided IN (0,1)),
  created_at TEXT NOT NULL,
  UNIQUE (year, seq)
);
CREATE INDEX IF NOT EXISTS folios_due ON folios(due_date, id);

CREATE TABLE IF NOT EXISTS folio_lines (
  id INTEGER PRIMARY KEY,
  folio_id INTEGER NOT NULL REFERENCES folios(id),
  label TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_amount INTEGER NOT NULL CHECK (unit_amount >= 0)
);
CREATE INDEX IF NOT EXISTS folio_lines_folio ON folio_lines(folio_id);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  assignee_id INTEGER NOT NULL REFERENCES accounts(id),
  date TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('departureClean','stayOver','deepClean')),
  status TEXT NOT NULL CHECK (status IN ('todo','inProgress','done'))
);
CREATE INDEX IF NOT EXISTS tasks_date ON tasks(date, id);
CREATE INDEX IF NOT EXISTS tasks_assignee_date ON tasks(assignee_id, date);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  contact TEXT,
  items_supplied TEXT
);
CREATE INDEX IF NOT EXISTS suppliers_name ON suppliers(name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  store TEXT NOT NULL CHECK (store IN ('bar','kitchen','linen')),
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  threshold INTEGER NOT NULL CHECK (threshold >= 0),
  unit_cost INTEGER NOT NULL CHECK (unit_cost >= 0),
  supplier_id INTEGER REFERENCES suppliers(id),
  UNIQUE (name, store)
);
CREATE INDEX IF NOT EXISTS items_name ON items(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS items_supplier ON items(supplier_id);

CREATE TABLE IF NOT EXISTS movements (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  kind TEXT NOT NULL CHECK (kind IN ('in','out','transfer')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  from_store TEXT,
  to_store TEXT,
  reason TEXT CHECK (reason IS NULL OR length(reason) <= 200),
  author_id INTEGER REFERENCES accounts(id),
  at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS movements_at ON movements(at, id);
CREATE INDEX IF NOT EXISTS movements_item_at ON movements(item_id, at);
CREATE INDEX IF NOT EXISTS movements_kind_at ON movements(kind, at);

CREATE TRIGGER IF NOT EXISTS movements_append_only_update
BEFORE UPDATE ON movements BEGIN SELECT RAISE(ABORT, 'append_only'); END;
CREATE TRIGGER IF NOT EXISTS movements_append_only_delete
BEFORE DELETE ON movements BEGIN SELECT RAISE(ABORT, 'append_only'); END;

CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('card','cash','transfer')),
  date TEXT NOT NULL,
  folio_id INTEGER REFERENCES folios(id),
  author_id INTEGER REFERENCES accounts(id),
  reverses_id INTEGER UNIQUE REFERENCES ledger(id),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ledger_date ON ledger(date, id);
CREATE INDEX IF NOT EXISTS ledger_kind_date ON ledger(kind, date);
CREATE INDEX IF NOT EXISTS ledger_folio ON ledger(folio_id);

CREATE TRIGGER IF NOT EXISTS ledger_append_only_update
BEFORE UPDATE ON ledger BEGIN SELECT RAISE(ABORT, 'append_only'); END;
CREATE TRIGGER IF NOT EXISTS ledger_append_only_delete
BEFORE DELETE ON ledger BEGIN SELECT RAISE(ABORT, 'append_only'); END;

CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,
  account_id INTEGER,
  role TEXT,
  action TEXT NOT NULL,
  module TEXT,
  record TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','refused')),
  status INTEGER,
  address TEXT
);
CREATE INDEX IF NOT EXISTS audit_at ON audit(at, id);

CREATE TRIGGER IF NOT EXISTS audit_append_only_update
BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT, 'append_only'); END;
-- Deletion is the retention job alone, which raises a flag in meta first.
CREATE TRIGGER IF NOT EXISTS audit_append_only_delete
BEFORE DELETE ON audit
WHEN (SELECT value FROM meta WHERE key = 'retention_running') IS NULL
BEGIN SELECT RAISE(ABORT, 'append_only'); END;

CREATE TABLE IF NOT EXISTS idempotency (
  key TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL,
  module TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
`;
