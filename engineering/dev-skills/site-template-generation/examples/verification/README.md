# verification

The gate in `SKILL.md` has items no request library can prove: a theme applied
before first paint, a reveal that actually runs, a keyboard path, a layout that
does not scroll sideways, a service worker that registers and serves an offline
page, and a field edited in the back office appearing on the public page. These
two scripts drive a real browser through them.

They exist because the first version of this skill claimed those items could not
be checked here. They could.

## Running

```bash
npm install                     # pulls Playwright and its Chromium

# In one terminal, the instance under test:
cd ../portfolio-sports-coach
npm install && npm run seed-media
npm run set-password -- 'mot-de-passe-de-verification-1234'
npm run build && PORT=3111 npx next start -p 3111

# In another:
npm run portfolio               # expects the portfolio on :3111
npm run showcase                # expects the showcase on :3112
```

The scripts take the password from `ADMIN_PASSWORD`, falling back to the one
above. They write to the instance: they edit a field in the back office and put
it back, and they send one message through the public form. Run them against an
instance you are willing to have written to, never against a client's.

## What each script proves

```
portfolio.mjs   theme from the system preference, the toggle, persistence and
                no flash; the reveal running and stopping under reduced motion;
                the skip link first in the tab order and focus visible; no
                horizontal scroll at 360 and 1920; the service worker
                registering, the offline fallback and the back office never
                served from cache; signing in, editing a field, seeing it on the
                public page, putting it back; the public form showing success
                and clearing; the site's own 404 with its status
showcase.mjs    both themes on a technical palette; no horizontal scroll on
                every route; the reveal at a low intensity; the service worker
                and the offline page; the quotation form filled as a visitor
                would, then found unread in the back office with its count
```

## What they do not prove

```
push delivery     a subscription needs a browser push service. Headless
                  Chromium here does not complete one, so the delivery path is
                  exercised server side instead: a stored subscription, a
                  failing send that is logged and never loses the message, and
                  an unsubscribe that deletes the record
screen reader     no assistive technology is driven here. The markup carries
                  labels, landmarks, a skip link and visible focus, and that is
                  a different claim from having been heard
```
