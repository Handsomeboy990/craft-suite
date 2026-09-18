# Phases 01 to 06: specification and architecture

Sized small: the whole front half of the delivery fits here.

## Phase 01, requirements-analysis (gate: none)

Input: "I want a link shortener."

- Explicit requirements: shorten a URL to a short code; visiting the short link
  redirects to the original; count each hit; a public form to submit a URL.
- Assumptions (recorded, not merged into requirements): links never expire;
  anyone can create a link; no custom aliases in this version.
- Constraints: must run on the existing Vercel and Postgres setup; French UI.
- Unknowns: abuse handling (someone shortening malicious URLs); rate of use.

## Phase 02, clarification (gate: approval)

Blocking questions, asked in one batch:

1. Should we block or scan submitted URLs for malware, or is an allowlist of
   schemes (http, https) enough for v1?
2. Is anonymous creation acceptable, or is a light rate limit per IP required?

Recorded assumptions for the non blocking gaps: code length is 7 base62
characters; hits are counted best effort, not billed.

APPROVAL (recorded): scheme allowlist is enough for v1; add an IP rate limit on
creation. Proceed.

## Phase 03, technology-selection (gate: none)

| Decision | Choice | Alternatives rejected | Trade-off accepted |
|---|---|---|---|
| Framework | Next.js App Router | plain Node + Express (more glue), Remix (no advantage here) | ties the app to the Next runtime, already the house stack |
| Store | Postgres (existing) | Redis-only (loses durability), SQLite (no serverless story) | one more table on a database already running |
| Codes | random base62, checked for collision | auto-increment then encode (leaks volume) | a rare retry on collision |

## Phase 04, architecture-proposal (gate: none)

- API: `POST /api/links` takes `{ url }`, returns `{ code, shortUrl }`.
  `GET /:code` responds 302 to the original and increments the hit count.
- Data: one table `links(code pk, url, hits int default 0, created_at)`, an
  index on `code` (the primary key covers it).
- Failure strategy: unknown code -> 404 page; invalid URL -> 422 with a message;
  collision on insert -> regenerate the code, bounded to 3 tries then 500.
- Decision record ADR-001: codes are random, not sequential, to avoid exposing
  how many links exist; reversible by adding an alias column later.

## Phase 05, validation (gate: approval)

Hard stop before any production code. The proposal is one screen, readable in a
minute; the gate confirms it serves the requirements and hides no complexity.

APPROVAL (recorded): architecture approved. Code may now be written.

## Phase 06, delivery-planning (gate: none)

Atomic tasks, in dependency order:

1. migration: create the `links` table.
2. `POST /api/links`: validate the URL scheme, generate a unique code, insert.
3. `GET /:code`: look up, increment hits, redirect; 404 on miss.
4. IP rate limit on creation (the Phase 02 approval).
5. the submit form and the five UI states.
6. tests: the redirect, the 404, the bad URL, the rate limit.

Each task names its validation and its tests, and is small enough to verify on
its own.
