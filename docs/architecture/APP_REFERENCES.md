# Application reference analysis

Phase 8.6, first task. Two full applications, `Balastrong/confhub` and
`adrianhajdin/yc_directory`, read as worked references for the delivery and
full-stack skills: architecture, data model, authentication, content
management, testing, deployment, what each does well and badly, and what the
suite should learn. They are not libraries; nothing here feeds `libraries/`.

This is a `research-core` output in the shape of `UI_REFERENCES.md`. Every
statement about either project was read in its source at the commit named and
is a fact unless it is labelled `inference`. Neither project was built or run
here, so nothing below claims runtime behaviour as observed. Patterns and
principles only: no code is copied, and what the suite ships is written in its
own terms.

```
reference       the real project, its code and assets, owned by its authors
inspiration     the direction it gives, free to take
pattern         the reusable technique, stated in the abstract
implementation  the original change in the suite's skills, the only thing committed
```

## The references, with licence

| Project | Licence (read) | Commit read | Stack |
|---|---|---|---|
| `Balastrong/confhub` | no `LICENSE` file in the tree; `package.json` declares `"license": "ISC"` only as package metadata | `090b043d2d51b6f9415db9df03191722d45713ee`, 2025-12-27 | TanStack Start, Router, Query and Form, React 19, Vite, PostgreSQL with Drizzle, Better Auth, Tailwind v4 and Radix, Netlify |
| `adrianhajdin/yc_directory` | none found: no `LICENSE` file, no licence field in `package.json`, no licence statement in the README | `67e6aa5aea64791136a2a0321b4bee688a07d75c`, 2024-10-29 | Next.js 15 canary, React 19 RC, Sanity as content store and studio, Auth.js (NextAuth v5 beta) with GitHub, Sentry, Tailwind 3 |

A metadata field in a manifest is not a licence grant to the repository, and
no licence at all means all rights reserved. Both are therefore treated as
patterns only, with no reuse of any kind, until a licence file is confirmed.
The GitHub API could not be queried from this environment, so the licence
column rests on the cloned tree alone.

How they were read: a shallow clone of each, outside this repository; every
source directory listed, and the files named below opened.

## confhub

### What it is

A directory of tech conferences and meetups, live at the domain its README
names: filters by date, country, tag and format, a calendar, RSVPs, threaded
comments, communities with members and admins, user event submissions, and a
natural-language filter backed by a language model.

### Architecture

One TanStack Start application. Pages and endpoints are file routes under
`src/routes`; all data access goes through server functions in
`src/services/*.api.ts`, each paired with a Zod schema file
(`*.schema.ts`), and the client reaches them through TanStack Query option
factories with structured keys in `src/services/queries.ts`. UI is grouped by
domain under `src/components`. Internationalisation is i18next with English and
Italian catalogues.

### What it does well

- **Validation and authorization at the server function, declared.** Every
  server function states its input validator and its middleware in the same
  chain (`inputValidator(...)`, then `middleware([userRequiredMiddleware])`),
  so the boundary is visible at the definition. The schema files are shared
  with the forms. Feeds `input-validation`, `backend-engineering`.
- **A rate limiter in the database, atomic.** `rate-limit.guard.ts` keeps
  fixed-window counters keyed by user, route, window and window start, and
  increments with a single insert-or-update whose update only applies while
  the count is under the limit; several windows (per minute, per day) are
  checked in one transaction, and a refusal returns 429 with `Retry-After` and
  limit headers. It guards the language-model endpoint. Feeds `api-design`,
  `backend-engineering`.
- **Model output treated as untrusted input.** The natural-language filter
  sends the model the allowed tags and countries read from the database,
  extracts JSON defensively, then parses the result with the same Zod schema
  the URL filters use, and fails with a clear error otherwise; the endpoint
  requires a session and is rate limited. Feeds `llm-integration`.
- **Ownership in the query.** Deleting a comment selects it by id and by the
  current user together, and answers 404 when either fails, so it neither
  deletes another user's comment nor reveals that it exists; a comment with
  replies is refused explicitly rather than failing on the foreign key. Feeds
  `backend-engineering`, `security-audit`.
- **A schema that encodes the rules.** Identity keys, unique slugs, enums for
  event mode, RSVP status and community role, a unique index on one RSVP per
  user and event, indexes matching the comment and RSVP access paths, cascade
  deletes on dependent rows, and row-level security enabled on every table.
  Feeds `database-design`.
- **Local parity.** A Docker Compose PostgreSQL with a health check, an
  `.env.example`, a seed script, and generated SQL migrations committed under
  `src/lib/db/migrations`. Feeds `environment-management`.
- **Content managed as data plus a script.** Bulk events live in
  `data-entry/data.json`, imported by a script with a separate production
  variant; users submit event URLs into an `event_requests` queue rather than
  publishing directly. Feeds `fullstack-engineering`.

### What it does badly

- **Drafts are not private.** `getEvents` has no authentication middleware and
  filters on a `communityDraft` value the caller supplies, so any caller can
  ask for drafts (inference from the code path: it was not exercised). Feeds
  `security-audit`, `backend-engineering`.
- **Create is not authorized like update.** `upsertEvent` checks community
  membership on update, but on create it inserts the caller's `communityId`
  and `draft` as given, with no membership check. Feeds `backend-engineering`.
- **Schema pushed from the build.** The Netlify build command runs
  `build:deploy`, which ends with `drizzle-kit push` against the configured
  database, while generated migrations sit unused in the repository. A
  deployment therefore changes the production schema by diff, not by a
  reviewed migration. Feeds `database-operations`, `deployment-engineering`.
- **Configuration drift.** The README lists Google OAuth variables as required
  and the auth module reads them, but `.env.example` omits them; the
  language-model variables (`LLM_TOKEN`, `LLM_ENDPOINT`, `LLM_MODEL`) are read
  but documented nowhere; the README's deployment section describes a
  `target: "netlify-edge"` option that `vite.config.ts` does not contain (it
  uses the Netlify plugin with edge rendering instead). Feeds
  `environment-management`.
- **Almost no tests, no CI.** One spec file (a debounce hook), no `test`
  script in `package.json`, and no workflow under `.github`. There is a
  detailed test-writing instruction file for a coding assistant, but the
  guidance has no suite to apply to. Feeds `testing-quality`, `ci-cd-pipelines`.
- **Prompts and outputs logged.** The language-model endpoint logs the user's
  prompt and the model's answer to the console. Feeds `data-privacy`.
- **Unbounded tables.** Rate-limit rows carry an expiry and an index on it, but
  nothing deletes them; anonymous event requests are accepted without a rate
  limit (inference: a spam path). Feeds `background-jobs`, `api-design`.
- **An agent that writes production.** A checked-in assistant agent definition
  exists to run the production data import, gated only by an argument hint.
  The suite treats a production data operation as an irreversible action that
  stops for the human. Feeds `devops-core`.

## yc_directory

### What it is

A tutorial companion project: a startup pitch directory where a signed-in user
submits a pitch with a title, description, category, image URL and a markdown
body, and others browse, search and view it. Content and authors are stored in
Sanity, and the Sanity Studio is mounted inside the application at `/studio`.

### Architecture

Next.js App Router with React Server Components. Reads go through a Sanity
client (CDN on for lists, off where freshness matters) and a live-content
helper; writes go through a separate write client holding a token. Pitch
creation is a server action. Sanity schemas define `author`, `startup` and a
curated `playlist`, and a type generation step runs before `dev` and `build`.

### What it does well

- **The write credential cannot reach the browser.** The write client module
  imports `server-only` and throws at load if its token is missing, so a
  client import fails the build and a missing secret fails at start. Feeds
  `secrets-management`, `environment-management`.
- **Fail fast on configuration.** Required public variables are asserted at
  module load with a message naming the variable. Feeds
  `environment-management`.
- **Types generated from the content schema.** Schema extraction and type
  generation run as `predev` and `prebuild`, so queries are typed against the
  real schema. Feeds `fullstack-engineering`.
- **Editorial curation as content.** An "editor picks" list is a document in
  the content store, edited in the studio, not a hardcoded list. Feeds
  `fullstack-engineering`.
- **Work after the response.** The view counter's write is deferred until
  after the response with the framework's after-response hook. Feeds
  `performance-engineering`.

### What it does badly

- **Validation only in the browser.** The form, a client component, parses its
  values with the Zod schema and then calls the server action; the action
  itself only checks the session and writes the raw form fields. A server
  action is a public endpoint, so the server accepts anything a caller sends.
  Feeds `input-validation`.
- **A server-side fetch inside the shared schema.** The image URL rule issues a
  `HEAD` request to the submitted URL to check its content type. It runs in the
  browser today; if the schema were applied on the server, as it should be, it
  would fetch arbitrary user URLs from the server (inference). Feeds
  `security-audit`, `input-validation`.
- **A lost-update counter.** Views are read, then set to the read value plus
  one, rather than incremented atomically; concurrent views lose counts
  (inference from the code path). Feeds `backend-engineering`.
- **Build gates disabled.** `next.config.ts` sets TypeScript build errors and
  lint errors to be ignored during builds. Feeds `ci-cd-pipelines`,
  `code-review-protocol`.
- **Pre-release runtime.** Next.js is pinned to a canary build and React to a
  release candidate. Feeds `dependency-selection`.
- **An open image proxy.** Remote images are allowed from any HTTPS host with
  SVG enabled, so the image optimizer will fetch and serve from anywhere
  (inference on consequence). Feeds `security-audit`, `performance-engineering`.
- **User markdown into raw HTML.** The pitch is rendered by a markdown parser
  and injected with `dangerouslySetInnerHTML`, with no explicit sanitiser; its
  safety rests entirely on the parser's default configuration. No exploit is
  claimed here. Feeds `security-audit`.
- **Small defects visible on reading.** The slug object's `_type` is set to the
  slug string itself; the search query mixes `&&` and `||` without
  parentheses, so the type filter appears not to apply to the search branches
  (inference); the home page logs the session id; no slug uniqueness check.
  Feeds `code-review-protocol`.
- **No tests, no CI; local files committed.** No test of any kind, no
  workflow, and an IDE directory and a Sentry wizard error log are committed.
  Feeds `testing-quality`, `git-workflow`.

## What the two teach together

```
                     confhub                          yc_directory
boundary             validator + middleware per       session check only, validation
                     server function                  in the browser
data store           relational, constraints,         content store, schema-light,
                     migrations generated             types generated
content management   JSON file + import script,       hosted studio inside the app,
                     submission queue                 editor-curated lists
secrets              env read at use                  server-only module, fail at load
tests and CI         one spec, no CI                  none
deployment           schema pushed in the build       build gates switched off
```

Inference from both: each has one thing the other lacks, and neither has a
test suite or a pipeline. A worked reference for the suite is the union of
their good halves under the suite's own gates.

## Patterns worth taking, with the suite skill each would feed

1. **The boundary is declared where the endpoint is defined**: schema, then
   authentication, then authorization, then the handler, on every server
   function or action, including create paths. `backend-engineering`,
   `input-validation`, `fullstack-engineering`.
2. **Every read that can see unpublished content is authorized on the server**;
   a visibility flag from the client is never trusted. `security-audit`.
3. **Ownership checks live in the query** and fail as not found.
   `backend-engineering`.
4. **Counters and limits are atomic in the store**: conditional upsert for
   limits, increment for counters, with retry headers on refusal and a cleanup
   job for expired rows. `backend-engineering`, `api-design`, `background-jobs`.
5. **Model output is parsed with the same schema as user input**, against
   allowed values read from the data, behind authentication and a rate limit,
   and is not logged with the user's prompt. `llm-integration`, `data-privacy`.
6. **Write credentials are confined to server-only modules** that fail at load
   when the secret is missing. `secrets-management`.
7. **Types are generated from the source-of-truth schema** as a build step.
   `fullstack-engineering`.
8. **Content management is chosen explicitly**: a file plus an import script, a
   submission queue, or a hosted studio, each with its review path; a
   production import is an irreversible action. `fullstack-engineering`,
   `devops-core`.

## What not to take, and why

- Schema changes pushed from a build step: migrations are reviewed and ordered,
  per `database-operations`.
- Type and lint errors ignored at build: a check is never weakened to get a
  green build, per `ci-cd-pipelines`.
- Canary and release-candidate runtimes in a deliverable: `dependency-selection`.
- Client-only validation, unauthenticated draft reads, logging of prompts and
  session ids: each is a finding, not a pattern.
- Any code, schema, prompt or asset: no licence was found that grants reuse.

## Follow-ups

Skill changes recommended, none made in this pass:

1. `fullstack-engineering`: a "boundary declared at definition" rule for
   server functions and server actions, create paths included, with the
   yc_directory client-only validation as the counter-example. Patterns 1 and 2.
2. `backend-engineering`: atomic counters and limits, ownership in the query,
   expired-row cleanup. Patterns 3 and 4.
3. `llm-integration`: model output parsed against the input schema with
   allowed values from the data, rate limited, not logged. Pattern 5.
4. `database-operations` and `deployment-engineering`: name "schema push from
   the build" as a refused practice.
5. `environment-management`: a drift check between variables the code reads,
   `.env.example` and the README, with confhub's three drifts as the example.
6. `delivery-orchestrator` `resources/delivery-checklist.md`: a worked line
   that an application with no test script and no workflow cannot pass the
   test gate, however complete its features look.
7. A possible worked example under `fullstack-engineering/examples/`: a small
   directory application built from the patterns above, original, passing the
   suite's gates. Decide with `delivery-orchestrator` before starting.

Not done in this pass: neither application was installed, built or run; the
GitHub licence metadata could not be queried; confhub's live site was not
visited.
