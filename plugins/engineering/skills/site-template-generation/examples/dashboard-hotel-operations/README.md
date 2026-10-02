# dashboard-hotel-operations

Reference implementation of the `dashboard` kind, applied to a small hotel:
the screens, the roles, the records, the figures, the endpoints, and the 26 line
gate of `resources/dashboard-contract.md`, with a script that runs every line
against a seeded instance. The specification this application was built from is
kept below, unchanged in substance, after the sections on running it.

The organisation is invented: Maison Lanterne, a thirty two room hotel with a
bar and a small kitchen, in a town called Ville-Exemple. Every name, number and
figure is fictional. Names are built from invented syllables, every email
address uses the reserved `example.test` domain, every telephone number the
range reserved for fiction. The structure was drawn from the principles of a
hotel management application the repository owner reviewed, reworked against
`resources/dashboard-contract.md`; no code, wording or asset was taken from it.

## Running it

Node 22.13 or later: the database is SQLite through the `node:sqlite` module
that ships with Node, so there is no native dependency to compile.

```bash
npm install --no-audit --no-fund
cp .env.example .env.local          # then set SESSION_SECRET, 32+ random characters
npm run seed -- --reset             # a year of fictional records, demonstration mode
npm run build
npm start                           # http://localhost:3000
```

`npm run seed` prints the seeded accounts, one per role plus a deactivated one,
and a single use link per account to set its password. For a review, set
`SEED_PASSWORD` (12 characters or more) and every seeded account gets it. The
seed is deterministic: `npm run seed -- --reset --today 2026-10-01` produces the
same records every time. It refuses to run with `HOTEL_ENV=production`, and it
refuses to write into a database holding records it did not create.

A real instance starts empty, with its first manager:

```bash
npm run create-admin -- --email someone@example.test --name "A Name"
```

which prints a single use link (72 hours) through which that person sets the
password. With `ADMIN_PASSWORD` in the environment the account gets it instead.

`npm run typecheck` runs the TypeScript compiler alone.

## Verifying it: the gate

```bash
npm run build
npm run gate                 # every line, D1 to D26
npm run gate -- D5 D11 D24   # some lines
```

The runner never touches `data/`. It builds its own instance under `.gate/`: a
copy of the configuration, the seed anchored on today, a random session secret,
a random password for the seeded accounts, and `next start` on port 3390 (a
second instance on 3391 for the first use states). One module per family of
lines, `scripts/gate/checks-server.mjs` for what a request and the source can
prove and `scripts/gate/checks-browser.mjs` for what only a browser can, each
line named by its id. Every line prints PASS or FAIL with what it observed; the
whole report is written to `.gate/report.json`, the screenshots of D15, D19 and
D23 to `.gate/screens/`.

The browser lines run in a real headless Chromium through `playwright-core`:
Playwright's own build when it is installed, otherwise the self-contained build
of `@sparticuz/chromium`, which installs from the npm registry where the
Playwright download host is unreachable, or any Chromium named in
`CHROMIUM_PATH`.

### What was observed

`npm run gate` on 2026-10-01, against the production build, Node 22.22,
headless Chromium 153: **26 of 26 lines passed**, none failed, none left
unverified. Seeded volume: 32 rooms, 4,389 stays, 3,000 guests, 3,762 folios,
300 items, 19,433 movements, 8,724 ledger entries, 6 accounts.

```
D1   128 files read: no instance name, no configuration sentence, no colour
     literal, no text in markup, no threshold value compared in code
D2   29 token pairs and every rendered badge, both themes, on the overview,
     the stays list, the overdue folios and a denied page (403): lowest pair
     border-strong on surface-alt 3.42 light, 3.60 dark (minimum 3); lowest
     badge 5.69 (minimum 4.5)
D3   system dark followed; light chosen, stored, already applied at the first
     readystatechange after a reload; back to system follows it again
D4   cancel removed from frontDesk in data/matrix.json: gone from the row and
     the page, POST answers 403; guests removed: gone from the navigation, 403
D5   201 calls by four roles to modules they do not hold: all 403, no record;
     79 calls without a session: all 401
D6   housekeeping on another's task, on its own task of another day, on a room
     outside today's tasks, frontDesk on an old guest: 404, byte for byte the
     answer for a missing id; the bookkeeper never receives guest notes
D7   17 actions on records in the wrong state: 409 (403 where the role lacks
     the grant), every record unchanged
D8   deactivated storekeeper: next request 401; frontDesk turned
     housekeeping: next /api/stays 403
D9   cookie httpOnly, SameSite Lax, nothing in document.cookie or storage;
     sign out deletes the server row and the old cookie answers 401; sixth
     failure 429 per address and per account, right password refused too
D10  338 audit rows hold the 403, 404 and 409 refusals, sign ins and writes,
     and none of 37 passwords, tokens and guest notes
D11  all eight cards equal their drill down (count, sum or average), for the
     manager and for housekeeping's scoped roomsToClean
D12  every card shows its period and its time of computation; overdueFolios
     reads "Overdue" with an icon; a cached answer keeps its first asOf
D13  status, arrival range, sort by total, page 3: identical after reload, in
     a second browser, and back returns page 2
D14  25 rows transferred out of 4,389, total stated "4,389 stays"
D15  first use (on a second, empty instance), filtered empty, error, loading
     and denied (403) on stays, stock and ledger, light and dark: 30
     screenshots in .gate/screens/D15
D16  trend forced to fail: 8 figures and the distribution still shown, the
     trend replaced by its own error and retry
D17  session expired on page 3: sign in returns to the exact URL, same rows
D18  offline banner with the data's time, row actions disabled and described
     by it; signed out with the network cut, the list is the offline page and
     the cache holds no page or API answer
D19  skip link first, then 82 Tabs to the last row's cancel, 3px outline in
     both themes, Escape returns focus; no click handler on a row or a cell
D20  11 tables with caption, scoped headers, one aria-sort; "Check in, stay
     of <guest>, room <number>" found in the accessibility tree
D21  trend and distribution: summary sentence and data table
D22  result count in role=status changes in place; check in toast in
     role=status; refused departure in role=alert, field aria-invalid and
     described by it
D23  360px: drawer named, modal, focus trapped, Escape returns focus; no
     target under 44px on six screens; no sideways scroll; tables scroll in
     their container with the first column sticky
D24  one key sent three times, two at once: one stay; room 12 booked from two
     sessions at once: 201 and 409
D25  every filtered list and count on stays, movements and ledger uses an
     index; overview interactive in 49 ms median over three loads
D26  this handover names every required item; backup taken, restored into a
     scratch directory, twelve tables identical
```

### What these results do not claim

```
time         D25 is measured against a server on the same machine, with no
             network between: it proves the work done per request is small,
             not what an office connection adds
totals       a count of a whole table with no filter reads every row, which
             is what any total costs; D25 reports those three plans as such
screen       no screen reader runs here. D20 and D22 read the accessibility
reader       tree and the ARIA wiring Chromium computes, which is a different
             claim from having been heard
looked at    D15 asserts each state's words and roles, and saves the
             screenshots; looking at them is a person's job, and a few were
             looked at while this was built, not all thirty
browser      one engine, Chromium 153, headless
```

## Roles and grants

Five roles, named in the configuration (`roles`) and granted in one matrix,
`lib/matrix.ts`. The navigation, the row buttons, the route guard and every
endpoint read that matrix and nothing else; a grant it does not hold is
refused. `data/matrix.json`, when present, replaces it without a rebuild, and is
validated against the declared modules and actions; a file that does not
validate denies everything but the overview.

| Module | Route | manager | frontDesk | housekeeping | storekeeper | bookkeeper |
|---|---|---|---|---|---|---|
| Overview | `/` | view | view | view | view | view |
| Rooms | `/rooms` | view, create, update | view, setOutOfOrder | view (today's task rooms), markClean | | |
| Stays | `/stays` | view, create, update, export, confirm, checkIn, checkOut, checkOutOverride, cancel | view, create, update, confirm, checkIn, checkOut, cancel | | | view |
| Guests | `/guests` | view, create, update, export | view, create, update (scoped) | | | view (never notes) |
| Folios | `/folios` | view, create, update, export, recordPayment, void | view, create, recordPayment | | | view, export, recordPayment, void |
| Tasks | `/housekeeping` | view, create, update | view | view (own, today), start, finish | | |
| Items | `/stock` | view, create, update, export | | | view, create, update, export | view |
| Movements | `/stock/movements` | view, export | | | view, create, export | view, export |
| Suppliers | `/suppliers` | view, create, update | | | view, create, update | view |
| Ledger | `/ledger` | view, export | | | | view, create, export, reverse |
| Reports | `/reports` | view, export | | | | view, export |
| Staff | `/staff` | view, create, update, deactivate, reactivate, changeRole | | | | |
| Audit | `/audit` | view, export | | | | |
| Settings | `/settings` | view, update | | | | |

Three named actions go beyond the letter of the specification and are recorded
here: `confirm` turns a provisional stay into a confirmed one, the only state
check in accepts; `checkOutOverride` is "the manager overrides" an unsettled
folio, held as a grant rather than a role name tested in code; `reactivate`
undoes a deactivation, since an account is never deleted. `returnToService`
puts an out of order room back, under the `setOutOfOrder` grant.

Record scope, applied inside every query of the list, the detail, the actions
and the export, so out of scope and missing give the same 404:

```
housekeeping   tasks assigned to the signed in account, dated today; rooms only
               through those tasks
frontDesk      guests with a stay to come or in house, or who left within 30
               days, or created by the desk; never the guest export
bookkeeper     stays and folios read only; the guest notes field is never
               selected for this role
```

## The eight KPIs

Each one is computed by the server in `lib/kpis.ts`, shown only to the roles
listed and only if the role can open its drill down, cached a minute per role
with the time of computation on the card, and its drill down applies the same
clauses, so the card and the list cannot disagree (gate line D11).

| Key | Question | Formula | Period | Status | Drill down | Roles |
|---|---|---|---|---|---|---|
| `occupancyTonight` | How full are we tonight? | stays confirmed or in house covering tonight, over rooms not out of order | tonight | below `kpis.occupancyTonight.thresholds.lowPercent`: warning | `/stays?night=today` (its total is the numerator) | manager, frontDesk |
| `arrivalsPending` | Who still has to arrive? | stays confirmed with arrival today | today | none | `/stays?arrival=today&status=confirmed` | manager, frontDesk |
| `departuresPending` | Who still has to leave? | stays in house with departure today | today | none | `/stays?departure=today&status=inHouse` | manager, frontDesk |
| `roomsToClean` | What is waiting for housekeeping? | rooms to clean; for housekeeping, only the rooms of their tasks today | now | above `warnAbove`: warning | `/rooms?status=dirty` | manager, frontDesk, housekeeping |
| `revenueMonth` | What have we earned this month? | income entries minus reversals, first of the month to today, compared with the same days last month | this month | none | `/ledger?kind=income&period=month` (its sum) | manager, bookkeeper |
| `overdueFolios` | Who owes us? | folios not void, not settled, past their due date: count and amount | now | above `dangerAbove`: danger | `/folios?status=overdue` | manager, bookkeeper, frontDesk |
| `itemsBelowThreshold` | What must be reordered? | items with quantity at or below threshold | now | above `warnAbove`: warning | `/stock?level=low` | manager, storekeeper |
| `averageRate` | What does a night sell for? | room revenue over room nights sold (in house or departed), each night of the month to tonight | this month | none | `/reports/rate?period=month` (its average) | manager, bookkeeper |

Under the figures: the income and expense of the last twelve weeks, the rooms
by status (a bar per status with its count written beside it), each with a
summary sentence and the data as a table; and the attention lists of the role:
arrivals to check in, departures to check out, today's tasks, items to reorder.
The figures, the trend and the distribution are computed independently: one
failing leaves the others in place, with its own error and retry.

## The settings

`data/content.json` is the configuration: the brand, both palettes and the
status tokens, the type, every interface string, the role names, the module
labels, the status and option words, the KPI labels, periods and thresholds,
the chart texts, the privacy notice and the retention periods. The manager
edits it from `/settings`. The field map is served by `GET /api/admin/fields`
and written by `PUT /api/admin/content { patch }`, the two endpoints the site
kinds share; every write is validated (a colour is a colour, a length a length,
a threshold a number, a time zone a time zone), refused by field name, written
atomically, and the previous file is snapshotted into `data/history/`, one
action away from a restore. Frozen: the module structure of the navigation,
the motion signature (`operational`) and the base URL.

## Personal data and retention

| Who | What is held | Who sees it | Retention |
|---|---|---|---|
| Guests | name; optionally email, telephone, notes of 500 characters at most | manager and front desk (scoped); the bookkeeper without notes; notes are never exported | anonymised after `privacy.retention.guestMonths` (36) months without a stay |
| Staff | name, email, role, active flag, password hash (scrypt, per account salt) | the manager | accounts are deactivated, never deleted, so the audit keeps its author |
| Staff activity | the audit log: when, who, role, action, module, record id, outcome, HTTP status, address. No password, token or free text field | the manager | `privacy.retention.auditMonths` (24) months |
| Sessions | an HMAC of the token, the CSRF token, expiry, address | nobody | `privacy.retention.sessionHours` (8) hours idle, deleted on sign out |

The retention is enforced by `lib/retention.ts`, at most every six hours, on a
request. The privacy notice is generated from these facts at `/privacy`,
reachable without signing in.

## The data directory, backup and restore

```
data/content.json        the configuration, the only tracked file
data/hotel.db            the database (SQLite, WAL), never tracked
data/history/            the previous configurations
data/matrix.json         the optional matrix override
data/faults.json         fault injection, honoured on a demonstration database only
```

```bash
npm run backup                       # backups/<timestamp>/: VACUUM INTO copy, configuration,
                                     # history, matrix, and a manifest with row counts
npm run restore -- backups/<stamp>   # stop the server first; checks integrity and counts,
                                     # moves the present database aside, restores
```

A backup is untested until a restore has been performed from it. Gate line D26
does both on every run: backup of the gate instance, restore into a scratch
directory, every table compared.

`DATA_DIR` moves the directory, which is what a container volume does.

## Secrets and environment

| Name | Required | Absent means |
|---|---|---|
| `SESSION_SECRET` | yes, 32 characters or more | every request that reads a session fails with a server error naming the variable |
| `DATA_DIR` | no | `./data` |
| `HOTEL_ENV` | no | `production` makes the seed refuse to run |

The example file is `.env.example`; no secret is in the repository, the
configuration or the bundle. Passwords are set out of band (`create-admin`, the
seed) or by their owner through a single use link.

## When this outgrows SQLite

One property, one server process, a few concurrent writers: SQLite in WAL mode
serialises the writes, which is what makes the overlap trigger and the stock
check real guarantees. A second property, writers on several machines, or the
rate limiter shared across hosts moves the instance to a server database; the
schema in `lib/schema.mjs` is plain SQL with constraints and triggers that
translate directly.

## Security, as built

```
session      random 32 byte token in an httpOnly SameSite=Lax cookie, Secure
             when the request arrived over https; the server keeps an HMAC of
             it; the account is joined on every request, so a deactivation or
             a role change applies to the next request
order        every endpoint: session, then the grant for the module and the
             action, then the record's scope in the query, then the state rule
             inside a serialised transaction
answers      401 no session, 403 no grant (the body names nothing), 404 out of
             scope or missing (identical), 409 a business rule, 422 a field
csrf         a token bound to the session, sent as x-csrf-token on every write
limits       sign in: five failures per address and per account, then refused
             for fifteen minutes with the same answer; exports ten a minute;
             writes 120 a minute per account
idempotency  every create carries an Idempotency-Key; a replay returns the
             first record
rules        no overlapping active stays in a room (trigger), departure after
             arrival, stock never below zero, a payment never above the folio,
             movements, ledger and audit append only (triggers)
headers      a content security policy with a per request nonce, nosniff,
             frame denial, referrer and permissions policies, HSTS, no-store on
             every page and endpoint
worker       caches the offline page and hashed build assets only; never a
             page or an API answer
```

## Specification

The text below is the specification the application implements. Where the
implementation made a decision the specification left open, it is recorded in
the sections above.

### Shape

The same shared shape as the two site examples, so the same fleet tools find
their way in.

```
app/                  routes: the shell, one directory per module, the API
lib/                  the role matrix, the KPI definitions, the status map, the
                      configuration loader, the session and the authorization
                      layer, the database access
data/content.json     the configuration: brand, both palettes, every interface
                      string, module labels, role names, KPI thresholds
data/                 the database file or its connection settings, the audit
                      log, the session store
scripts/              set the first administrator, seed fictional records,
                      back up, restore
public/               icons and the offline page assets
```

A server process, not a static export. The records live in a relational
database with constraints; SQLite is enough for one property, and the threshold
that moves the instance to a server database (concurrent writers, a second
property) is recorded in the handover.

### Roles

Five roles, set in the configuration by name and in the matrix by grant.

| Role | Who | Works on |
|---|---|---|
| `manager` | the person who runs the hotel | everything, including staff and settings |
| `frontDesk` | reception | rooms, stays, guests, folios |
| `housekeeping` | the cleaning team | the tasks assigned to them today, and the status of those rooms |
| `storekeeper` | whoever keeps the bar, kitchen and linen stores | items, movements, suppliers |
| `bookkeeper` | the accountant, in house or not | folios, the ledger, reports |

### Modules and the matrix

`V` view, `C` create, `U` update, `X` export, and the named actions of the
module. A blank cell is a refusal, by the server, with 403.

| Domain | Module | Route | manager | frontDesk | housekeeping | storekeeper | bookkeeper |
|---|---|---|---|---|---|---|---|
| | Overview | `/` | V | V | V | V | V |
| Front desk | Rooms | `/rooms` | V C U | V, set out of order | V own tasks' rooms, mark clean | | |
| Front desk | Stays | `/stays` | V C U X, check in, check out, cancel | V C U, check in, check out, cancel | | | V |
| Front desk | Guests | `/guests` | V C U X | V C U | | | V |
| Front desk | Folios | `/folios` | V C U X, record payment, void | V C, record payment | | | V X, record payment, void |
| Housekeeping | Tasks | `/housekeeping` | V C U | V | V own, start, finish | | |
| Stores | Items | `/stock` | V C U X | | | V C U X | V |
| Stores | Movements | `/stock/movements` | V X | | | V C X | V X |
| Stores | Suppliers | `/suppliers` | V C U | | | V C U | V |
| Books | Ledger | `/ledger` | V X | | | | V C X, reverse |
| Books | Reports | `/reports` | V X | | | | V X |
| Administration | Staff | `/staff` | V C U, deactivate, change role | | | | |
| Administration | Audit | `/audit` | V X | | | | |
| Administration | Settings | `/settings` | V U | | | | |

Record scope, enforced in every query:

```
housekeeping   tasks where assignee is the signed in account and date is today;
               rooms only through those tasks
frontDesk      guests reached through a stay, or created by the desk; never the
               guest export
bookkeeper     folios and stays read only, never a guest's notes field
```

The navigation shows a domain only when the role holds one of its modules.
Settings, Staff and Audit appear to the manager alone.

### Records

Money is an integer in minor units with the currency in the configuration. Dates
of stays are calendar dates in the hotel's time zone; every other time is
stored in UTC.

```
Room         number unique, type (single, double, twin, family), floor,
             nightlyRate, status (available, occupied, dirty, cleaning,
             outOfOrder), outOfOrderReason
Stay         room, guest, arrival, departure, adults, children, status
             (provisional, confirmed, inHouse, departed, cancelled), total,
             createdBy, idempotencyKey unique
             constraint: departure after arrival
             constraint: no two stays in one room overlap while provisional,
             confirmed or inHouse, enforced in the database or in a serialised
             transaction, not only by a check before the insert
Guest        name, email optional, phone optional, notes (limited length, never
             exported, never shown to the bookkeeper), createdAt, lastStayAt
Folio        stay, number unique and sequential per year, lines, total, paid,
             dueDate; status computed: settled, open, overdue
Task         room, assignee, date, kind (departure clean, stay-over, deep
             clean), status (todo, inProgress, done)
Item         name, store (bar, kitchen, linen), unit, quantity, threshold,
             unitCost, supplier
             constraint: quantity never below zero
Movement     item, kind (in, out, transfer), quantity above zero, fromStore,
             toStore, reason, author, at. Append only: a mistake is corrected
             by a movement in the other direction
Supplier     name, contact, items supplied
LedgerEntry  kind (income, expense), category, amount above zero, method, date,
             folio optional, author. Append only: a correction is a reversing
             entry that points at the one it reverses
Account      name, email, role, active, createdAt. Deactivated, never deleted
AuditEvent   at, account, role, action, module, record, outcome, address
```

### Overview

Eight figures, each a definition before it is a card. Each one is computed by
`GET /api/overview` on the server and shown only to the roles listed.

| Key | Question | Formula | Period | Status | Drill down | Roles |
|---|---|---|---|---|---|---|
| `occupancyTonight` | how full are we tonight | stays inHouse or arriving tonight, over rooms not outOfOrder | tonight | below the configured low threshold: warning | `/stays?night=today` | manager, frontDesk |
| `arrivalsPending` | who still has to arrive | stays confirmed with arrival today | today | none | `/stays?arrival=today&status=confirmed` | manager, frontDesk |
| `departuresPending` | who still has to leave | stays inHouse with departure today | today | none | `/stays?departure=today&status=inHouse` | manager, frontDesk |
| `roomsToClean` | what is waiting for housekeeping | rooms dirty, for housekeeping only those in their tasks | now | above threshold: warning | `/rooms?status=dirty` | manager, frontDesk, housekeeping |
| `revenueMonth` | what have we earned this month | sum of income entries, minus reversals, month to date | this month, compared with the same days last month | none | `/ledger?kind=income&period=month` | manager, bookkeeper |
| `overdueFolios` | who owes us | folios overdue, count and amount | now | above zero: danger | `/folios?status=overdue` | manager, bookkeeper, frontDesk |
| `itemsBelowThreshold` | what must be reordered | items with quantity at or below threshold | now | above zero: warning | `/stock?level=low` | manager, storekeeper |
| `averageRate` | what does a night sell for | room revenue over room nights sold, month to date | this month | none | `/reports/rate?period=month` | manager, bookkeeper |

Under the figures:

```
trend        income and expense per week over twelve weeks, for manager and
             bookkeeper. Text twin: "Income rose from 4,120 to 5,870 over twelve
             weeks; the lowest week was week 7." and the weekly table
distribution rooms by status now, for manager, frontDesk and housekeeping, as
             a bar per status with its count written on it, not a ring of
             colours. Text twin: the same counts as a list
attention    for frontDesk: the arrivals and departures of today with their
             check in and check out actions; for storekeeper: the items below
             threshold with a reorder action; for housekeeping: today's tasks
```

The figures, the trend and the distribution load independently: one failing
leaves the others in place, with its own error and retry.

### Tables, one per module

The stays list, as the model for the others.

```
columns     guest, room, arrival, departure, nights, total (right aligned),
            status (badge with its word), actions
default     arrival ascending, from today
filters     status, arrival range, departure range, room type, search by guest
            name or room number. All in the query string
paging      server side, 25 per page, total stated: "112 stays"
actions     check in       confirmed, arrival today or earlier, role holds it
            check out      inHouse, folio settled or the manager overrides
            cancel         provisional or confirmed, before arrival; asks once,
                           names the guest and the dates, safe choice first
            open           a link to /stays/<id>, named "Stay of <guest>, room
                           <number>"
detail      /stays/<id>: the stay, its folio, its history from the audit log,
            the actions it allows; the breadcrumb returns to the filtered list
```

Every other module follows the same contract: declared columns, server paging,
filters in the URL, actions conditioned on state and on grant, a detail route.

### States, as worded in the example configuration

```
loading         skeleton rows matching the columns
first use       Stays: "No stays recorded yet. A new stay starts with a guest
                and a room." with "New stay" for roles that hold it
filtered empty  "No stays match these filters." with "Clear filters"
error           "The stays could not be loaded. Your other screens still
                work." with "Try again"
denied          "Your role does not include the ledger. The manager can grant
                it." HTTP 403
expired         "Your session ended. Sign in to continue where you were."
offline         "You are offline. Figures are from 14:05. Changes are paused."
demo            "Demonstration data. Nothing here is real." on every screen when
                the demonstration source is on, never in a production build
```

### Configuration

`data/content.json`, edited by the manager from `/settings`, validated and
written atomically like the content file of the site kinds.

```
site        name, shortName, locale, timeZone, currency, baseUrl
theme       palettes.light, palettes.dark (the keys of trade-profiles.md, plus
            warning, info and the five status surfaces), type, radius,
            spacing, density, motion { signature: operational, intensity,
            baseDuration, easing }
roles       the display name of each role key
nav         the domain headings and module labels, in order
kpis        per key: label, thresholds, visible or not
ui          every interface string: states, actions, confirmations, toasts,
            table captions, chart summaries' templates, the 404, the offline
            page, the sign in page
privacy     the staff and guest privacy notice facts, and the retention periods
            the software enforces: guest records, audit events, sessions
```

### Endpoints

```
POST  /api/admin/login           { identifier, password }
POST  /api/admin/logout
GET   /api/session               user, role, grants
GET   /api/admin/fields          the settings the manager may change
GET   /api/admin/content         the configuration
PUT   /api/admin/content         { patch }
GET   /api/overview              the KPIs, the charts, for this role
GET   /api/<module>              list, paged, sorted, filtered, scoped
GET   /api/<module>/<id>         one record, scoped
POST  /api/<module>              create, with Idempotency-Key
PATCH /api/<module>/<id>         update the fields the role may update
POST  /api/stays/<id>/check-in   and check-out, cancel; folios record-payment,
                                 void; tasks start, finish; ledger reverse;
                                 staff deactivate, change-role
GET   /api/<module>/export       CSV of the current filters, rate limited
```

Every one checks the session, then the grant for the module and the action,
then the record's scope, in that order, before it reads anything.

### Fictional seed

`scripts/seed` generates twelve months of records from a fixed seed, so that two
runs produce the same data and the gate's figures can be compared. Names are
built from invented syllables, email addresses use the reserved `example.test`
domain, telephone numbers use a reserved fictional range. Volume, so that paging
and indexes are measured rather than assumed: 32 rooms, about 4,000 stays, 3,000
guests, 300 items, 20,000 movements, 9,000 ledger entries, one account per role
plus a deactivated one.

### Acceptance checklist

The dashboard gate of `resources/dashboard-contract.md`, made concrete for this
instance. Each line is run against a seeded instance and its outcome recorded.

```
D1   search app/ and lib/ for the hotel's name, a colour literal, a threshold
     number and any interface sentence: none found
D2   both palettes measured on the overview, the stays list and a denied page,
     including every status badge on its surface
D3   theme switched, reloaded, set to follow the system: no flash
D4   remove stays.cancel from frontDesk in the matrix: the action disappears
     from the row, and POST /api/stays/<id>/cancel answers 403
D5   with each of the five roles, call every endpoint of every module the role
     does not hold: 403 for each, no record in the body
D6   as housekeeping, request a task assigned to someone else, and a room not in
     today's tasks: 404, identical to a missing id
D7   check out a provisional stay, cancel an inHouse one, void a settled folio
     as frontDesk: 409 or 403, record unchanged
D8   deactivate the storekeeper while signed in: the next request answers 401;
     change frontDesk to housekeeping: the next request to /api/stays is 403
D9   no token in localStorage or sessionStorage; cookie httpOnly; signing out
     deletes the server record; the sixth failed sign in is refused
D10  the refusals of D5 to D7, the sign ins and the writes are in the audit
     log; no password, token or guest note in it
D11  for each of the eight KPIs, follow the drill down: the list's total equals
     the figure
D12  each KPI shows its period; overdueFolios above zero reads as overdue in
     words and by icon; a cached figure shows its time
D13  filter stays by status and arrival range, sort by total, go to page 3,
     reload, copy the URL into another browser signed in as frontDesk, press
     back: the same list each time
D14  the stays list transfers 25 rows and states the total of the seeded year
D15  force each state on stays, stock and ledger, in both themes, and look at it
D16  make the trend endpoint fail: the figures and the distribution stay
D17  expire the session on page 3 of a filtered list: sign in returns there
D18  cut the network: banner, age of the data, writes disabled with the reason;
     sign out, cut the network, reload: no record is served from cache
D19  from the skip link to the cancel action of the last row on the stays list,
     by keyboard alone, focus visible in both themes
D20  every table has a caption; sorted column carries aria-sort; "Check in"
     reads "Check in, stay of <guest>, room <number>" in the accessibility tree
D21  the trend and the distribution each have a summary and a data table
D22  the result count, the toast after a check in, and a refused field are
     announced
D23  at 360px: the drawer, Escape, focus returning, 44px targets, the stays
     table scrolling inside its container with the guest column sticky
D24  submit a new stay twice with one key: one stay. Book room 12 for the same
     night from two sessions at once: one success, one 409
D25  query plans of the stays, movements and ledger lists on the seeded volume
     use an index; the overview interactive in under two seconds, measured
D26  the handover: roles and grants, the eight KPIs with question, formula and
     drill down, the settings, the personal data held and for how long, the
     backup command, and a restore performed from it
```

### What this example is not

It is not a design to copy onto a client, and it is not a port of the
application it was drawn from. It is the smallest complete statement of what an
operations dashboard built by this skill must do, written so that an
implementation can be held to it line by line.
