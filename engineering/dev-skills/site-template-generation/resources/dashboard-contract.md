# Dashboard contract

The third kind. A portfolio and a showcase are public pages with a back office
behind them; a dashboard is the back office, grown into the product. Its users
are the staff of one organisation, signed in, each with a role, working on
records that change all day. This file is the contract for it: what the screens
are, how they are arranged, what every table, figure and filter promises, who
may do what, and the gate a dashboard passes before it counts as finished.

## What changes from the site kinds

| | portfolio and showcase | dashboard |
|---|---|---|
| Reader | a visitor, anonymous | a member of staff, signed in |
| Accounts | one operator | several, each with a role |
| What changes | the content file | records in a database, all day |
| Who edits the configuration | the client, in the back office | an administrator, in the settings module |
| Public routes | the site | the sign in page, the 404, the offline page |
| Legal surface | the pages the kind owes | a privacy notice for the staff and for the people whose records it holds |
| Motion | the trade's signature | `operational`: feedback only, see below |
| Success | a visitor makes contact | a member of staff answers a question or completes a task without leaving the screen |

What does not change: the template holds no client fact and no visual literal,
both palettes are authored and measured, every string a person reads is in the
configuration file, and nothing is declared finished before the gate at the end
of this file passes whole.

## The four artefacts, for this kind

```
template       the shell, the modules, the components, the authorization layer.
               Written once, reused for every organisation
configuration  data/content.json: the brand, both palettes, every interface
               string, the module labels, the KPI thresholds, the role names.
               Written by an administrator from the settings module
tokens         the palette keys of trade-profiles.md, plus the status tokens
               below, consumed as the same custom properties
records        the organisation's data, in a database, reached only through
               endpoints that authorize every call. Never in the configuration
               file, never in the bundle
```

The configuration is the content file of the other kinds, and keeps its rules:
validated on write, written atomically, snapshotted before each change,
restorable in one action. Records are not configuration. A KPI threshold is
configuration; a booking is a record.

## Information architecture

A dashboard is organised by what the staff do, not by the tables the database
holds.

```
domain        a group of modules that one kind of work shares: the front desk,
              the stores, the books. A domain is a heading in the navigation
module        one screen, one route, one permission key. A list of records of
              one type, with its filters, its detail and its actions
overview      the first screen after sign in: the figures each role needs
              before deciding what to do next, and a way into each of them
detail        one record, its history and its permitted actions. Reached from a
              row, addressable by URL, never only a state inside a list
settings      the configuration an administrator may change, generated from
              the contract like the back office of the other kinds
administration accounts, roles and the audit log. Last in the navigation,
              visible to the roles that hold it and to nobody else
```

A module that two roles reach with different needs stays one module, filtered
by what each role may do. Two copies of the same list drift.

### Roles and permissions are data

```
role          a name in the configuration, and a set of grants
grant         module and action: view, create, update, delete, export,
              approve, and any action the module declares
matrix        one table, role by module by action, held by the server and
              published read only to the client
one source    the navigation, the route guard, the visible buttons and the
              server check all read the same matrix. Two lists of permissions,
              one in the menu and one on the server, are two lists that will
              disagree
default deny  a grant not in the matrix is refused. A new module is reachable
              by nobody until a grant names it
```

Permission by module alone is not enough. A receptionist who may see invoices
may not necessarily cancel one: the action is the unit, and a row action the
role does not hold is absent from the row, and refused by the server when
called anyway.

## Layout and navigation

```
shell          a navigation rail, a top bar and the work area. The rail is
               fixed from the wide breakpoint up and becomes a drawer below it
rail           the domains as headings, the modules under them, the current
               one marked by more than colour: weight, a bar, and
               aria-current="page"
counters       a module may carry a count of what needs attention, low stock,
               unpaid invoices. The count is computed by the server for this
               role, announced with its meaning ("4 items below threshold"),
               and absent when zero rather than showing 0
top bar        the drawer button below the breakpoint, the page title, the
               theme and language switches, the account: name, role, sign out
work area      the page header (title, one line of context, the primary
               action), then the content. One primary action per page
drawer         a real dialog below the breakpoint: the button names it and says
               whether it is open, focus moves into it, Escape and the overlay
               close it, focus returns to the button
width          the work area uses the width. A table with twelve columns in a
               640px column is a horizontal scroll nobody asked for
breadcrumb     on a detail page, the way back to the filtered list it came
               from, filters intact
```

The navigation shows only the modules the role holds. That is a courtesy to
the user. The control is on the server, see Security.

## The overview

A handful of figures, each one answering a question a role asks every day, and
each one a door into the records behind it.

### A KPI is a definition before it is a card

| Field | Holds |
|---|---|
| `key` | stable identifier, never renamed after delivery |
| `label` | the words on the card, from the configuration |
| `question` | the question it answers, in the handover, for example "how full are we tonight" |
| `formula` | stated in words and implemented once, on the server |
| `unit` | count, money, percentage, duration |
| `period` | today, this month, a rolling window, stated on the card |
| `comparison` | optional: the previous period, the same period last year |
| `thresholds` | optional: the values where the status changes, from the configuration |
| `drill` | the module and the filters that list exactly the records counted |
| `roles` | the roles that see it, which is also the roles allowed to follow `drill` |
| `asOf` | the time the figure was computed, shown when it is not live |

Rules:

```
few           six to eight on the overview. A ninth figure is a report, not a
              signal
server side   computed by the server from the records, never summed in the
              browser over a page of rows it happened to load
drill down    every figure links to the list of records it counts, filtered.
              A figure the user cannot open is a figure they cannot trust
same number   the count on the card equals the row count of its drill down,
              verified, not assumed
status        a threshold crossed changes the card's status token, and the
              status is also stated in words and by an icon. Colour alone
              carries nothing
formatted     by the locale of the user: currency, decimal separator, date.
              Money is stored in minor units, as an integer
zero          a zero is a value, shown as 0 with its meaning, not as an empty
              card. No data is a different state, shown as such
period        the period is visible on the card. "Revenue" without "this
              month" invites the wrong decision
```

### What sits under the figures

```
trend         one time series chart for the figure that moves most, with its
              period selectable
distribution  one breakdown, for the state of the stock the role manages: rooms
              by status, items by threshold
activity      the most recent records the role acts on, five to ten, each one a
              link, with "view all" to the module filtered the same way
attention     the records that need an action today, arrivals, departures,
              overdue, below threshold, each with its action in reach
```

## Tables

The table is where the work happens. It is one component, configured per
module by data, never rewritten per screen.

```
columns       declared as data: key, label from the configuration, type, align,
              sortable, the cell renderer. Numbers and money aligned right,
              text left, a status as a badge with its word
headers       a real <table>, <thead>, <th scope="col">, and a <caption> or an
              aria-label naming the list. A grid of divs is not a table
sorting       the sort control is a <button> inside the <th>, the <th> carries
              aria-sort, and the direction is shown by more than an arrow
paging        on the server, with page and page size in the request and the
              total in the response. Paging in the browser over the whole
              collection works on demonstration data and fails on the first
              real year
row action    a button or a link in the row, named with the record ("Check in
              room 12"), never a click handler on the <tr>. A whole row as the
              only way into a record is unreachable by keyboard
conditional   an action appears only when the record's state allows it and the
              role holds it, and the server enforces both
bulk          optional. A bulk action states how many records it will touch
              before it runs, and reports how many it did
density       the configuration's density token sets the row height; the
              minimum target stays 44px for anything tapped
overflow      a wide table scrolls inside its own container, with the first
              column sticky, never the page
export        an action like any other: a grant, an audit entry, the current
              filters applied, and a format named on the button
```

## Filters, search and the URL

```
in the URL    every filter, the search, the sort and the page live in the query
              string. A filtered list can be bookmarked, shared, reloaded and
              reached from a KPI, and the back button restores it
search        debounced, server side, with the field it searches named in its
              label ("Search by guest or room")
filters       labelled controls, each with an "all" value. Active filters are
              shown as removable chips, and one action clears them all
counts        the result count is stated and announced to assistive technology
              when it changes, in a polite live region
empty         a filter that matches nothing says so and offers to clear the
              filters, which is a different state from a module with no records
dates         a date range is two labelled fields with the format shown, and
              the period is resolved in the organisation's time zone, on the
              server
```

## Forms and actions

```
create        in a dialog for a short record, on its own route for a long one.
              A dialog traps focus, names itself, and returns focus on close
validation    on the server, always. The browser repeats the cheap checks for
              speed; the server is the authority, and its error is shown on the
              field it names
rules         a business rule, no overlapping stays in one room, no stock below
              zero, is enforced by the database or in a transaction, not only by
              a check before the write. Two clerks clicking at once is the case
              the rule exists for
idempotent    a create carries a client generated key, so a double click or a
              retried request creates one record
destructive   a delete, a cancellation or a refund asks once, names the record
              and the consequence, and puts the safe choice first. Where the
              domain allows, it is a state change that can be reversed rather
              than a removal
feedback      the result is announced: a toast in a polite live region for
              success, an alert role for failure, and the list reflects the
              server's answer rather than an optimistic guess it never checked
pending       a submitting button is disabled and says so; leaving a form with
              unsaved changes asks first
```

## Charts

```
one palette   series colours are tokens, both themes, measured against the
              surface they sit on. No hex literal inside a chart's options
text twin     every chart has a text alternative: a summary sentence stating
              the trend and the extremes, and the data as a table one action
              away. A chart a screen reader cannot read is a figure half the
              audience never received
not colour    series are told apart by label, pattern or marker as well as by
              colour, and the legend is real text
axes          labelled, with units, starting at zero for a bar, formatted in the
              user's locale
empty         a chart with no data in the period says so in place, never an
              empty frame with axes
reduced       no animated draw-in under prefers-reduced-motion, and none at all
              at the operational signature's default
```

## States, every one designed

A screen has more states than its happy path, and each one is designed in the
tokens, in both themes, with its words in the configuration.

| State | When | What the screen shows |
|---|---|---|
| loading | the first request is pending | a skeleton of the layout, not a spinner over a blank page; `aria-busy` on the region |
| refreshing | data is shown and a newer request is pending | the data, and a discreet indicator; nothing jumps |
| empty, first use | the module has no records yet | what the module is for, and the action that creates the first record, if the role holds it |
| empty, filtered | records exist, none match | the active filters, and an action that clears them |
| error | the request failed | what failed in the user's words, a retry, and the rest of the page still working; never a blank screen and never a raw message |
| partial | one widget failed, the others did not | the error inside that widget only |
| denied | the role does not hold the module or the action | a page saying the access is not granted and who grants it, with HTTP 403; not a redirect that hides it |
| not found | the record or the route does not exist | the dashboard's own 404, in the shell, with a way back |
| session expired | the server answered 401 | a sign in that returns to the same URL, filters intact, and keeps an unsaved form when it can |
| offline | the network is gone | a banner saying so, the last data marked with its age, writes disabled with the reason stated |
| stale | the data is older than its freshness rule | the time it was computed, next to it |

The list store behind each module carries these explicitly: the records, a
loading flag, an error, whether it has loaded once, and the time it last did.
A screen that tracks an error and never renders it has an error state only on
paper.

## Accessibility

Applied while building, then verified with `accessibility-testing`.

```
keyboard      every action reachable by Tab, in reading order; no click handler
              on a non interactive element; a visible focus ring on both themes
skip link     to the work area, first in the tab order
landmarks     nav for the rail, header, main for the work area, one h1 per page
tables        caption or name, th with scope, aria-sort on sortable columns,
              row actions named with their record
forms         a label per field, errors tied by aria-describedby and announced,
              required stated in words, never by colour or an asterisk alone
live regions  the result count, the toast and the save status are announced;
              a failure uses an alert
status        a badge carries its word; a dot or a colour is decoration only
charts        the text twin above
dialogs       named, focus trapped, Escape closes, focus returns
contrast      measured on both palettes, including every status token on its
              tinted surface
zoom          usable at 200 percent and reflowing at 320 CSS pixels without
              losing an action
```

## Security

`authorization-design`, `authentication-security`, `session-security` and
`rate-limiting` govern; `admin-security.md` holds the patterns this kind keeps.
What a dashboard adds is that there are many users and they are not equal.

```
on the server   every route and every endpoint checks the session and then the
                grant for the module and the action, before reading anything.
                Hiding a link, a button or a menu entry is presentation
no client gate  a route guard in the browser is a convenience that sends the
                user somewhere useful. It is never the reason a request is
                refused; the request is refused because the server refused it
records too     a grant on a module is checked against the record: a user who
                may see their own shift does not see another's by changing an
                id in the URL. Every query is scoped on the server
session         in an httpOnly cookie, never a token in localStorage where any
                script on the page can read it
accounts        one account per person, never a shared login; created by an
                administrator, the first password set by its owner through a
                single use link, deactivated rather than deleted so the audit
                trail keeps its author
roles change    a role changed or an account deactivated takes effect on the
                next request, not at the next sign in
csrf            a token bound to the session on every state changing request
rate limits     on the sign in, on export, and on every write, per account
audit           every privileged action appended: who, what, which record,
                when, from where, allowed or refused. Readable by the roles
                that hold it, and never containing a password, a token or a
                free text field the record holds
exports         a grant, a row limit, an audit entry, and the same record
                scoping as the list
personal data   what the records hold about guests, customers or staff is
                inventoried with `data-privacy`: why each field is kept, for
                how long, and who may see it. The retention is enforced by the
                software
headers         the policy and headers of `admin-security.md`, and no-store on
                every response that carries records
```

## Data and the API

```
GET    /api/session            -> { ok, user: { id, name, role }, grants }
                                  grants is the matrix row for this role, read
                                  only, used to render; the server still checks
GET    /api/<module>           ?page&pageSize&sort&<filters>
                               -> { ok, items, total, page, pageSize }
GET    /api/<module>/<id>      -> { ok, item } or 404, never another tenant's
                                  record and never a 200 with an empty body
POST   /api/<module>           Idempotency-Key header -> { ok, item }
PATCH  /api/<module>/<id>      -> { ok, item } or { ok: false, error, field }
POST   /api/<module>/<id>/<action>  a named state change: check-in, cancel,
                                  approve. Never a free status field the client
                                  sets to any value
GET    /api/overview           -> { ok, kpis: [ { key, value, unit, period,
                                  status, asOf, drill } ], charts }
```

```
401         no session, or an expired one
403         a session without the grant; the body names neither the record nor
            whether it exists
404         not found, or found and out of the user's scope, the same answer
409         a conflict with a business rule or a concurrent edit, naming it
422         a field refused, naming the field
```

The settings module keeps the back office endpoints of the other kinds,
`/api/admin/fields` and `/api/admin/content`, with their shapes, so a fleet
tool that checks the configuration works here too. The sign in takes an
identifier as well as the password, because this kind has several accounts.

A demonstration mode with generated records is welcome for review. It is a
separate data source behind the same endpoints, it says so on every screen
with a banner, and it can never be on in a production build.

## Tokens for status

The palette keys of `trade-profiles.md` stay. A dashboard adds what it needs to
speak about state, in both themes, measured like the rest:

```
warning, info              alongside success and danger, carrying text
<status>Surface            the tinted background of a badge or a card in that
                           status: successSurface, warningSurface,
                           dangerSurface, infoSurface, neutralSurface
chart.series               an ordered list of colours for categorical data,
                           each measured against surface at 3:1
```

```
<status> on <status>Surface    4.5:1, both themes, because a badge carries text
<status> on surface            4.5:1
chart.series on surface        3:1, and distinguishable by more than hue
```

One map, status of the domain to status token, lives in the template: a room
`occupied`, an invoice `overdue`, an item `below threshold`. Every badge,
card and chart reads that map; no screen picks a colour for a state itself.

## Motion: the operational signature

`motion-system.md` holds the signatures. A dashboard uses `operational`: no
entrance, no reveal, no stagger, no counter, no parallax, no lift. People open
it forty times a day and every movement is a delay they pay forty times.

What moves is feedback only, at the intensity the configuration sets:

```
drawer       the rail sliding in below the breakpoint
dialog       a fade, short
toast        arriving and leaving
sort         nothing. The rows are replaced, not animated into place
```

`prefers-reduced-motion` removes all of it, as everywhere.

## Performance

```
first screen  the shell and the overview interactive in under two seconds on a
              mid range laptop over a normal office connection, measured
queries       every list query uses an index that matches its default sort and
              its common filters, verified with the query plan on a seeded
              volume of a year of records, not on twenty
payload       a page of rows, never the collection. Columns the table does not
              show are not sent
overview      the KPIs computed in one round trip, cached per role for a short
              window when they are expensive, with asOf shown
charts        the chart library loaded with the overview only, not in the shell
no waterfall  the requests a screen needs are issued together
```

## The dashboard gate

Twenty six checks. All twenty six pass, or the dashboard is not finished.

```
D1   every string a user reads, every colour and every threshold resolves from
     the configuration, verified by searching the components for literals and
     finding none
D2   both palettes measured in the browser on the rendered shell, every pair of
     trade-profiles.md and every status pair above passing, both themes
D3   the theme switch works, persists, follows the system preference and does
     not flash on load
D4   the matrix is the only source: removing a grant from a role removes the
     module from the navigation, hides the action, and makes the server answer
     403, all three verified
D5   for every role, every endpoint of every module it does not hold is called
     directly with that role's session, and every call answers 403 with no
     record in the body
D6   for every role, a record outside its scope is requested by id: 404, the
     same answer as a record that does not exist
D7   every action a row can carry is called against a record in a state that
     does not allow it: refused with 409, nothing changed
D8   an account deactivated, or a role changed, takes effect on the next
     request of an existing session
D9   the session is an httpOnly cookie, no token is readable by script, signing
     out ends it on the server, and the sign in is rate limited, verified by
     exceeding it
D10  every privileged action and every refusal of D5 to D7 appears in the audit
     log, with no password, token or free text field in it
D11  every KPI equals the row count, or the sum, of its drill down list,
     verified on seeded data for each one
D12  every KPI shows its period, its status in words when a threshold is
     crossed, and its asOf when it is not live
D13  every filter, the search, the sort and the page survive a reload, a
     shared URL and the back button
D14  paging is done by the server: a seeded year of records loads one page,
     and the total is right
D15  every module renders its loading, first use empty, filtered empty, error
     and denied states, each forced and looked at, in both themes
D16  a failed widget on the overview leaves the others working
D17  an expired session sends the user to sign in and back to the same URL,
     filters intact
D18  the offline banner appears with the network cut, writes are disabled with
     the reason stated, and the service worker never serves a record from
     cache to a signed out browser
D19  every action is reachable and operable by keyboard alone, from the skip
     link to the last row action, with a visible focus on both themes; no
     click handler sits on a row or a cell
D20  every table has a name, column headers with scope, and aria-sort on the
     sorted column; every row action is named with its record
D21  every chart has its text twin: a summary sentence and the data as a table
D22  the result count, the toasts and form errors are announced, verified with
     the accessibility tree
D23  the navigation at 360px is a drawer that names itself, traps focus,
     closes on Escape and returns focus; nothing tapped is under 44px; no page
     scrolls sideways, a wide table scrolls inside its container
D24  a double submitted create produces one record, and two concurrent writes
     that would break a business rule produce one success and one 409
D25  every list query on a seeded year of records uses an index, and the
     overview is interactive in under two seconds, both measured
D26  the handover lists the roles and their grants, every KPI with its
     question, formula and drill down, the settings an administrator may
     change, the data the dashboard holds about people and for how long, and
     how the database is backed up and restored, with a restore performed
```

A dashboard with demonstration data passing every check may be reviewed. It is
delivered when the gate passes on the organisation's own seeded volume, with
its real roles.
