# Example: remediating a booking form, measured

A restaurant booking page, audited with `accessibility-testing`: nine findings
across seven barrier families. The same page is remediated twice, once from the
scanner report alone and once by the rules of this skill, and both are graded
by the verify loop of `accessibility-testing` with checks written and proven
before either remediation existed.

Everything below is the output of a real run. The page, the checks and the
runner are in `booking-form-run/`; `npm install` then `node run.mjs` reproduces
it. The page is built for this example: it is a sample of nine findings, not a
codebase, and its result says nothing about any other page.

## The findings

```
A11Y-01  images        the entrance map carries the step-free entrance; no alt
A11Y-02  images        a dining room picture, no alt, purpose stated nowhere
A11Y-03  names         icon-only "remove guest" button with no name
A11Y-04  roles         "Add guest" is a div with a click handler
A11Y-05  forms         email labelled only by a placeholder
A11Y-06  forms         email error shown in red: not tied, not flagged, no focus
A11Y-07  custom widget room chooser built from divs: no focus, keys or role
A11Y-08  focus         primary button with its outline removed
A11Y-09  contrast      hint text #999999 on white, 2.85 to 1
```

## The checks, proven first

`booking-form-run/checks.mjs` holds one barrier check per finding, the
universal layer (focus visible, target size, reflow at 320 pixels, reduced
motion) and six preservation checks. Before any remediation was written, the
runner proved them:

```
checks.mjs sha256 6ac95abf3e8f6e8990fc40a5a6bcf03c339f87a91475489e7add2a56660e14e3
engine 153.0.8010.0 (Chromium only), axe-core 4.13.0, no screen reader

floor: before.html        9 of 9 barrier checks fail, 6 of 6 preservation pass
ceiling: reference.html   9 of 9 barrier checks pass, universal layer passes,
                          6 of 6 preservation pass
gaming: gaming.html       8 of 9 barrier checks fail on a known gaming fix:
                          alt="", aria-label="button", role="button" with
                          tabindex and no keys, aria-label instead of a label,
                          a live region created with the error, listbox roles
                          over the divs, a transparent outline
  note  A11Y-09 passes on its gaming fix (a forked colour, 4.54 to 1); the
        check cannot see it
CHECKS PROVEN
```

The hash was recorded at that point, and every result below printed the same
one. The contrast check measures a ratio, so it cannot tell a token from a
one-off grey: that half of A11Y-09 belongs to `code-review-protocol`, and the
example says so rather than hiding it.

## What the scanner reported

`node scan-only.mjs before`, the whole report a team without this skill
receives:

```
critical  button-name      .icon-btn
serious   color-contrast   #email-hint
critical  image-alt        #access-map
critical  image-alt        #dining-room
4 violations
```

Four of nine. The placeholder-only field, the div button, the error nobody
hears, the custom select and the missing focus outline are invisible to it.

## Remediation A: from the scanner report

`surface/scanner-driven.html`. Each reported violation silenced by the smallest
change a reviewer would plausibly accept: `alt="Map"`, `alt="Dining room"`,
`aria-label="Remove guest"`, the hint darkened to #767676.

```
A11Y-01  scan clean  scanner gamed  name "Map"
A11Y-02  scan clean  scanner gamed  no recorded intent; alt="Dining room"
A11Y-03  scan clean  fixed          name "Remove guest"
A11Y-04  scan clean  not fixed      never reached by Tab
A11Y-05  scan clean  not fixed      name "Email address"; visible label none
A11Y-06  scan clean  not fixed      focus on ""; description ""; invalid false
A11Y-07  scan clean  not fixed      never reached by Tab
A11Y-08  scan clean  not fixed      outline none 3px rgb(255, 255, 255)
A11Y-09  scan clean  fixed          rgb(118, 118, 118) on white, 4.54 to 1
scanner-clean 9/9 (100 percent)   fixed 2/9 (22 percent)
```

A clean scan, and seven of nine people still blocked. A11Y-02 counts as gamed
because its alternative is a guess at a purpose nobody stated; it would be
gamed even if the guess later turned out right.

## Remediation B: by the rules of this skill, round 1

`surface/rules-round1.html`. Triage put the forms and the div button first,
as blocking. Two findings needed an answer the source did not give, and were
escalated in one batch instead of guessed:

```
A11Y-02  Does the dining room photograph tell a visitor anything they need,
         or is it atmosphere? Neither the content brief nor the page says.
A11Y-07  May the custom room chooser become a native select? Its look would
         change; nothing in the specification requires the custom one.
```

The rest by family: the step-free fact as a visible caption (the content brief
says the map exists for it), a name with action and object on the icon button,
a native button for "Add guest", a visible label, the error tied, flagged and
given focus, a `:focus-visible` outline offset from the filled button, and the
hint moved to the `--text-muted` token. No ARIA was added over the room
chooser while its question was open.

```
A11Y-01  scan clean  fixed      name "Map of the entrance on Rue Example"
A11Y-02  scan flags  escalated
A11Y-03  scan clean  fixed      name "Remove guest 2"
A11Y-04  scan clean  fixed      role button; guests 2 -> Enter 3 -> Space 4
A11Y-05  scan clean  fixed      visible label "Email address"
A11Y-06  scan clean  fixed      focus on "email"; description "Enter an email
                                address, like name@example.com We send the
                                confirmation here."; invalid true
A11Y-07  scan clean  escalated
A11Y-08  scan clean  fixed      outline solid 3px rgb(11, 87, 208)
A11Y-09  scan clean  fixed      rgb(89, 89, 89) on white, 7.00 to 1
scanner-clean 8/9 (89 percent)   fixed 7/9 (78 percent)   escalated 2
```

The scanner-clean rate is lower than remediation A's and the fixed rate is
three and a half times higher. The finding the scanner still flags is the one
deliberately left alone until a person answers.

## Round 2: the answers applied

The owner answered both: the photograph is atmosphere, and the native select
is fine. `surface/rules-round2.html` applies them as ordinary changes:
`alt=""` on the photograph, and the custom chooser replaced by a labelled
`select`, which arrived focusable, arrow-key operable, named and exposing its
value with no script written for any of it.

```
A11Y-02  scan clean  fixed  answer decorative; alt=""
A11Y-07  scan clean  fixed  role combobox; name "Room"; value main -> ArrowDown terrace
scanner-clean 9/9 (100 percent)   fixed 9/9 (100 percent)
```

## Side by side

```
                  scanner-clean      fixed
before            5/9  (56 percent)  0/9  (0 percent)
scanner-driven    9/9 (100 percent)  2/9 (22 percent)
rules, round 1    8/9  (89 percent)  7/9 (78 percent), 2 escalated
rules, round 2    9/9 (100 percent)  9/9 (100 percent)
```

Before any change, the scanner already called five of nine findings clean. The
scanner-clean column cannot tell remediation A from round 2; the fixed column
is the only one that can.

No regression occurred in this run, so the regression class is untested here:
the universal layer and the preservation checks ran on every variant and
passed wherever a barrier check passed.

## Limits

```
engines      Chromium 153 only, headless
AT           no screen reader; names, descriptions and roles were read from
             Chromium's accessibility tree through the DevTools protocol,
             which is an approximation and is not reported as a screen
             reader pass
separation   one author wrote the checks, the reference and both
             remediations. The separation was held in time and in files: the
             checks were proven and hashed before either remediation was
             written and were not edited afterwards. In a real engagement the
             fixer and the verifier are different agents (section 10 of the
             skill)
not measured keyboard traps, zoom to 200 percent, text spacing, colour in a
             dark theme, cognitive load, the forked-colour half of A11Y-09
sample       one page, nine constructed findings; round 2 reaches the
             ceiling of these checks, which says these nine barriers are
             gone, not that the page is accessible
comparison   remediation A is a constructed baseline, the plausible minimum
             for each reported violation; it is not a measurement of any
             real team
```
