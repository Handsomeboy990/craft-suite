# Supabase and Next.js appendix

The abstract items in `launch-checklist.md` stay stack agnostic. This appendix
names the concrete failure each one maps to on a Supabase and Next.js project,
the stack these items are most often written against. It is a reading aid, not
a second checklist: every row here is one row of the grid, made concrete.

Nothing in this file is a credential. Every capitalised name is an environment
variable name, never its value. A real value never appears in the repository,
in a log, or in a screenshot.

## Keys and secrets

| Abstract item | Concrete failure on this stack | How to check here |
|---|---|---|
| No privileged key client side | the service role key reaches the browser | the service role key is read only in server code (route handlers, server actions, server components); it never appears in a client component, in `NEXT_PUBLIC_` anything, or in the built client bundle |
| No secret in the client bundle | a server secret is exposed through a `NEXT_PUBLIC_` variable | only the project URL and the anon or publishable key carry the `NEXT_PUBLIC_` prefix; grep the built bundle for the service role key and any other server secret and find nothing |
| Public key client side | the client uses a privileged key instead of the anon key | the browser client is created with the anon or publishable key; the service role client is constructed only on the server |
| No secret in the repository | a `.env` or `.env.local` holding real keys is committed | `.env*` is git ignored except an example with placeholder values; the git history carries no real key; a leaked key is rotated in the Supabase dashboard, not just removed |

## Database access

| Abstract item | Concrete failure on this stack | How to check here |
|---|---|---|
| Row level access at the database | row level security is off on a table, so the anon key reads every row | row level security is enabled on every table holding user data, and a policy scopes each row to its owner; verified by querying with a second user's session and getting only their rows |
| Server side authorization | authorization is done in the React component, so a crafted request bypasses it | the check that matters runs in a route handler, a server action, or a database policy, never only in client code |
| Minimal fields returned | a select returns columns the client should not see | the query selects explicit columns, not a blanket select; internal and other user columns are not returned |
| Automated database backup | reliance on the platform default with no restore rehearsal | backups are configured, and a restore into a scratch project has actually produced the data at least once |

## Auth and sessions

| Abstract item | Concrete failure on this stack | How to check here |
|---|---|---|
| Passwords hashed | not applicable when Supabase Auth owns credentials | Supabase Auth stores the hash; a custom credential table, if any, uses a strong slow hash |
| Secure session cookies | the auth cookie is not http only or not scoped | the session cookie set by the auth helpers is http only, secure and same site; verified in the browser cookie inspector |
| Login rate limited | unlimited login and one time code attempts | login and one time password endpoints are throttled, by the platform setting or an added limit |
| Email confirmation on signup | confirmation is disabled, so an unverified email can act | email confirmation is required in the Auth settings where the design needs it |

## Application surface

| Abstract item | Concrete failure on this stack | How to check here |
|---|---|---|
| API not on the frontend | business logic and secret calls run in the client | privileged calls run in route handlers or server actions, not in client components; the browser never holds the logic or the key |
| All inputs validated | a route handler trusts its request body | every route handler and server action validates its input at the boundary before use |
| Errors not leaked | a thrown error returns a stack trace to the browser | production error responses are generic; detail stays in the server log |
| Security headers set | the framework default headers ship unchanged | the headers are set in the framework config or middleware, and observed on the response |
| HTTPS enforced | preview or custom domain served over plain HTTP | the host redirects HTTP to HTTPS and sets the transport security header |
| Signed webhooks | a webhook route acts without verifying the signature | the webhook route verifies the provider signature before doing anything |

## Discoverability and product

| Abstract item | Concrete failure on this stack | How to check here |
|---|---|---|
| Favicon | the framework starter icon still ships | the project icon is served at every declared size |
| Social preview image | no metadata image, so a shared link is a bare URL | the metadata declares an image; a preview tool renders a card |
| Custom 404 | the framework default not found page ships | a not found file styled to the project is present and rendered on an unknown route |
| sitemap.xml and robots.txt | absent, or the starter robots blocks the whole site | both are served and match the real indexing intent |
| No dead functionality | a button wired to a handler that only logs | every reachable control does something real, verified by using it |
