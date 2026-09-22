# verification

The gate in `SKILL.md` has items no request library can prove: a theme applied
before first paint, a reveal that actually runs, a keyboard path, a layout that
does not scroll sideways, a service worker that registers and serves an offline
page, and a field edited in the back office appearing on the public page. These
scripts drive a real browser through them.

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
npm run gate                    # every field, one by one, on :3111
npm run mobile                  # 360px in both themes, with screenshots
                                # KIND only names the screenshot folder: both
                                # read the pages from the instance's sitemap
npm run hardcoded ../portfolio-sports-coach
npm run prose ../portfolio-sports-coach
npm run contrast                # every colour pair the stylesheet uses, on :3111
npm run guidance                # what the client is told is left to do, on :3111
npm run policy                  # the content security policy, in a browser
npm run portfolio               # the whole surface, on :3111
npm run motion                  # what moves, on :3111
npm run account                 # the menu, the favicon, the password, on :3111
npm run showcase                # the whole surface, on :3112
npm run signature               # what must not move on a technical trade, :3112
BASE_URL=http://localhost:3112 ADMIN_PASSWORD=... npm run account

# The login limit is five attempts in fifteen minutes, so a run of several
# scripts in a row will trip it. That is the product working. Clear the counter
# between runs rather than waiting:
INSTANCE=../portfolio-sports-coach npm run unlock
```

Run the instance with `npm run build && npm start`, not `npm run dev`. The
policy the middleware serves in production forbids `eval`, which React's
development build needs; the development server relaxes it for itself, so
verifying against `dev` would verify a policy no client is ever served.

The scripts take the password from `ADMIN_PASSWORD`, falling back to the one
above. They write to the instance: they edit a field in the back office and put
it back, and they send one message through the public form. Run them against an
instance you are willing to have written to, never against a client's.

## What each script proves

```
gate.mjs           the first point of the gate, exhaustively: every field the
                   back office offers is changed through the endpoint the back
                   office uses, the public pages are read to see the change
                   arrive, and the original value is put back. It ends by
                   comparing the content file with what it was, byte for byte.
                   The fields come from `/api/admin/fields`, which every
                   instance publishes, so this no longer needs to know the
                   admin's routes or its markup. 98 on the portfolio, 113 on
                   the showcase. A first run
                   after a file was edited by hand reports the restore as
                   failed: the writer normalises the formatting. Run it twice
mobile.mjs         360px, both themes, every route: no sideways scroll, no
                   target under 44px, no clipped text, and a screenshot of each
                   page in shots/ so the result can be looked at
hardcoded.mjs      the source rather than the page: no client fact, no email,
                   no telephone number and no colour or font literal inside a
                   component. It reads the instance's own content file to know
                   what a client fact looks like
portfolio.mjs      theme from the system preference, the toggle, persistence and
                   no flash; sections armed and revealed on scroll; nothing
                   hidden under reduced motion; the skip link first in the tab
                   order and focus visible; the service worker registering, the
                   offline fallback and the back office never served from cache;
                   signing in, editing a field, seeing it on the public page,
                   putting it back; the public form showing success and
                   clearing; the site's own 404 with its status
showcase.mjs       both themes on a technical palette; the reveal at low
                   intensity; the service worker and the offline page; the
                   quotation form filled as a visitor would, then found unread
                   in the back office with its count
motion.mjs         the hero entrance running once; each staggered item carrying
                   its own delay; items hidden before they enter and visible
                   after; a counter reaching its value; parallax writing its
                   property; and all of it absent under reduced motion
signature.mjs      the opposite proof, on a technical trade: no entrance, no
                   stagger, no parallax, no counter, with the reveal and the
                   lift still there. A signature that changes nothing is a label
prose.mjs          the content file read as language: no truncated sentence, no
                   mangled accent, no word broken in the middle. Content
                   corruption does not raise an error anywhere else
contrast.mjs       the sixteen pairs section 5 of the skill requires, measured
                   on the rendered page in both themes, reading the resolved
                   custom properties rather than the JSON. It exists because a palette
                   shipped whose light theme painted white on a near white
                   button, and reading the file never showed it
guidance.mjs       the two surfaces a client with no knowledge depends on: a
                   dashboard listing what is left to do, computed rather than
                   remembered, every item linking to where it is fixed and
                   closing by itself when it is; and a help page covering how a
                   change goes live, what each section does, undoing a mistake,
                   why a legal fact is never invented, and a forgotten password.
                   It also fails on jargon, at 1280px and at 360px
xss.mjs            the policy, checked in the browser that has to enforce it:
                   an injected script does not run, the theme still works, and
                   nothing legitimate is refused
nav-and-account.mjs the menu at 360px with its button, its state, 48px targets,
                   Escape closing it and focus returning; the menu button absent
                   above the breakpoint; the favicon coming from the content and
                   being served; the password changed from the back office, the
                   wrong current one refused, the short one refused, every
                   session ended and the new one working
```

`gate.mjs` and `nav-and-account.mjs` write to the instance they run against.
The gate puts every value back and says whether the file matched. The account
script changes the password and puts the original one back before it finishes,
so the scripts that follow can still sign in; if it is interrupted in the
middle, `npm run set-password` restores it. Run both against an instance you
are willing to have written to, never against a client's.

## Pointing them at an instance that did not exist yet

`gate.mjs` and `mobile.mjs` used to carry a table of the two templates written
here, which meant they could verify the two sites that already existed and
nothing generated afterwards. They now ask the instance: `routes.mjs` reads
`/sitemap.xml`, which lists exactly the pages that instance serves, and adds
the offline page and a path nobody serves so the site's own 404 answers.

So a newly generated template is verified by starting it and pointing
`BASE_URL` at it: the pages come from its sitemap and the fields from
`/api/admin/fields`, both fixed by section 4 of the skill. `KIND` now only names the screenshot directory. An instance
without a sitemap stops the run with a message rather than falling back to a
guess, because such an instance already fails gate point 13.

It found something on the way in: the old table left the showcase's privacy
page out, so that page had never been looked at at 360px.

`portfolio.mjs`, `showcase.mjs` and `signature.mjs` stay specific to the two
templates here, and say so: they assert what those particular sites contain.

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
