# dashboard-hotel-operations

Specification of the `dashboard` kind, applied to a small hotel: the screens,
the roles, the records, the figures, the endpoints, and the acceptance checklist
an implementation must pass before it is called finished. It is a specification,
not yet a runnable application. Everything an implementation needs to decide is
decided here, and every line of the checklist can be verified against a running
instance.

The organisation is invented: Maison Lanterne, a thirty two room hotel with a
bar and a small kitchen, in a town called Ville-Exemple. Every name, number and
figure below is fictional. The structure was drawn from the principles of a
hotel management application the repository owner reviewed, reworked against
`resources/dashboard-contract.md`; no code, wording or asset was taken from it.

## Shape

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

## Roles

Five roles, set in the configuration by name and in the matrix by grant.

| Role | Who | Works on |
|---|---|---|
| `manager` | the person who runs the hotel | everything, including staff and settings |
| `frontDesk` | reception | rooms, stays, guests, folios |
| `housekeeping` | the cleaning team | the tasks assigned to them today, and the status of those rooms |
| `storekeeper` | whoever keeps the bar, kitchen and linen stores | items, movements, suppliers |
| `bookkeeper` | the accountant, in house or not | folios, the ledger, reports |

## Modules and the matrix

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

## Records

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

## Overview

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

## Tables, one per module

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

## States, as worded in the example configuration

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

## Configuration

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

## Endpoints

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

## Fictional seed

`scripts/seed` generates twelve months of records from a fixed seed, so that two
runs produce the same data and the gate's figures can be compared. Names are
built from invented syllables, email addresses use the reserved `example.test`
domain, telephone numbers use a reserved fictional range. Volume, so that paging
and indexes are measured rather than assumed: 32 rooms, about 4,000 stays, 3,000
guests, 300 items, 20,000 movements, 9,000 ledger entries, one account per role
plus a deactivated one.

## Acceptance checklist

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

## What this example is not

It is not a design to copy onto a client, and it is not a port of the
application it was drawn from. It is the smallest complete statement of what an
operations dashboard built by this skill must do, written so that an
implementation can be held to it line by line.
