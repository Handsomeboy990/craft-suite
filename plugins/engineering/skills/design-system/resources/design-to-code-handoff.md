# Design-to-code handoff

The whole path from an agreed brief to a delivered site, as ADR 0006 decided
it (`docs/decisions/0006-brand-content-and-site-pipeline.md`). Eight steps, in
order. Each has an owner, an artefact, a gate, and a condition that blocks the
next step. A step is never skipped silently: a step that does not apply is
recorded as not applicable, with its reason, in the delivery record.

The ADR lists seven steps. This file states the identity and content work as
its own step, step 2, because the canvas is filled from what that step signs;
the other six follow the ADR in its order.

Names used below:

```
the chief     delivery-orchestrator, which holds the phase gates and the
              verdict (team-routing.md section 1)
the owner     the person the project belongs to: the user of the session, or
              the client where there is one; never an agent
the canvas    a Design artifact on the Claude Design canvas, or a project on
              claude.ai/design; optional, step 3
signed        recorded as signed in a sign-off record, by someone other than
              the author; a value nobody objected to is not signed
```

## 1. The path at a glance

| Step | Owner | Artefact | Gate | Blocks the next step when |
|---|---|---|---|---|
| 1 Brief validated | the chief; `requirements-analyst` drafts | validated brief, open questions answered or recorded as assumptions | `project-brief`, `requirements-analysis`, `clarification-gate` | positioning, audience or constraints are missing |
| 2 Identity, line, content | `design-director` for the identity; `community-manager` for the line and the content | signed charter and token file; editorial line; site copy; social plan when there is one | `brand-identity` section 12; `document-core` gate for the line and plan | the identity is not signed, or the copy carries an unsourced fact |
| 3 Canvas | `design-director`; `ui-ux-engineer` fills it | prototype record, mode a, b or c | the prototype uses the signed token values and the approved copy | no prototype exists in any of the three modes |
| 4 Sign-off | the owner and `design-director` | canvas sign-off record | both signatures, on a named version | either signature is missing, or the version signed is not the version read |
| 5 Tokens synced | the owner starts `/design-sync`; `ui-ux-engineer` checks or applies | token diff, reviewed | synced or applied values equal the signed token file | any value differs from the signed record |
| 6 Build | `site-template-engineer` or `frontend-engineer` | the site, with its tests run and observed | `validation-gate` before, `code-review-protocol` after, the kind's own gate | the review or the kind's gate fails |
| 7 Design verification | `design-verification`; `design-director` decides | drift record | no open defect; every deviation decided | an accessibility, truthfulness or token defect is open |
| 8 Production verification | `devops-engineer` deploys within delegation; `release-engineer` verifies | verification report; handover records for every post | `production-verification` | nothing after it: this is the gate before "delivered" |

## 2. Step 1: the brief is validated

```
owner       the chief, delivery-orchestrator; requirements-analyst drafts
skills      project-brief, then requirements-analysis and clarification-gate
input       the owner's request, the client's existing material
artefact    the validated brief: positioning, audience, constraints, the site
            kind if it is a template (portfolio, showcase, dashboard), the
            channels if there is a content programme, the facts only the
            client holds, and the open questions with their state
```

Gate: the three facts `brand-identity` section 2 requires (positioning,
audience, constraints) are present, and every question `clarification-gate`
raised is answered or recorded as an assumption it allows. The questions go to
the owner once, grouped.

Blocks step 2: a missing positioning, audience or constraint. An identity, a
line or a prototype built on an unvalidated brief is a guess, and every later
gate inherits it.

## 3. Step 2: identity, editorial line and content

Two owners work in parallel from the same brief.

```
identity    design-director owns brand-identity and signs it off;
            design-research drafts the moodboard, ui-ux-engineer the palette,
            type and tokens; the drafter never signs
line        community-manager drafts editorial-line, from the brief and the
            identity's voice brief, and never contradicts a signed charter
content     community-manager drafts the site copy held to the line, and the
            social-content plan when the brief names channels
artefacts   the signed charter and token file (brand-identity section 12,
            sign-off record in resources/token-handoff.md); the editorial
            line with its version and state; the site copy per page; the
            social plan and post briefs when there is one
```

The identity may be drafted on the canvas (`brand-identity` section 11), but a
draft on the canvas is not the record. The record is the signed charter and
token file in the repository.

Content rules, for the copy that will reach the prototype and the site:

- Every fact traces to the client, a cited live source, or a visible marker,
  `[TO CONFIRM: ...]`, naming who holds it (`document-core` evidence rule).
- No invented figure, testimonial, client name, award or audience number.
- A placeholder looks like a placeholder. Filler text styled as final copy is
  not allowed on a canvas the owner will sign.
- A conflict between the line and the signed identity goes to `design-director`
  and the owner; the conflicting copy stays out until they decide.

Gate: the identity is signed per `brand-identity` section 12; the line and
the plan have passed the `document-core` gate, or are marked provisional with
their open points listed.

Blocks step 3: an unsigned identity. The canvas may hold an identity board in
draft, but no prototype of the site is filled with token values that are not
signed. The copy may be provisional, provided it is marked as such on the
canvas.

## 4. Step 3: the design canvas

```
owner       design-director; ui-ux-engineer fills the prototype,
            community-manager supplies the copy
input       the validated brief, the signed token file, the charter, the
            approved or provisional copy
artefact    the prototype record below, whatever the mode
```

### What no tool does

No tool sends a brief to Claude Design and receives its generation back
unattended. This was verified on 2026-10-04 and recorded in `docs/ROADMAP.md`
phase 9. An agent therefore never waits for a generation, never polls for one,
and never presents a prototype it drew itself as one the canvas generated. It
uses one of the three modes below and says which.

If that fact changes, this section changes. The gates of steps 4 to 8 do not.

### Mode a: the agent creates and fills the canvas

The agent creates a Design artifact and fills it from the validated brief, the
signed token file and the copy. Every colour, type step, spacing and radius on
the canvas is a value from the signed token file, entered as that value, never
picked by eye. The pages covered and the states shown are listed in the
record. What the prototype does not show (loading, empty, error, 404, offline,
a long name, another language) is listed too, as states still to design, not
left to the build to improvise.

### Mode b: the owner's link, read back

The owner pastes the brief into claude.ai/design and hands back the link. The
agent reads the prototype back: the bundle is self-contained HTML an agent can
read (verified 2026-10-04, same record). The agent then:

- records the link, the date it was read and the version or revision shown;
- compares every value on the prototype with the signed token file, and lists
  each difference as a finding for `design-director`, never silently adopts
  the canvas value;
- checks every line of copy against the line and the evidence rule, and marks
  any invented fact the generation introduced;
- never claims the generation as its own work.

A link the agent cannot open is reported to the owner with the error. It is
not reconstructed from memory or from a screenshot description.

### Mode c: no canvas

Nothing in the pipeline requires a vendor tool. Without a canvas:

```
tokens      the signed token file in the repository
charter     the signed charter in the repository
mock-ups    static HTML pages in the repository, one per page of the site,
            reading the tokens as CSS custom properties (the --cu-* names of
            libraries/ui, or the site template's theme), with the copy from
            the line and the placeholders visibly marked
states      the same list of states shown and states still to design
```

The static mock-ups are prototypes, not the first version of the site. Step 6
builds the site from them under the same rules as from a canvas bundle.

### The prototype record

```
PROTOTYPE   <product>, v<n>, <date>

Mode            a canvas, agent filled | b owner link, read back | c static
Location        <artifact URL> | <claude.ai/design link> | <repository path>
Read on         <date and revision, for mode b>
Tokens          <token file path>, version, signed on <date>
Copy            <editorial line version>, state signed | provisional
Pages           <each page or screen covered>
Viewports       <each width shown>
Themes          light | dark | both
States shown    <per component or page>
States owed     <each state not shown, with who designs it>
Differences     <every value differing from the signed token file, mode b>
Open questions  <each, blocking or not blocking>
```

Gate: the record is complete; every token value equals the signed file, or the
difference is listed; every line of copy is sourced or marked.

Blocks step 4: no prototype in any mode, or a prototype whose values were not
checked against the signed token file.

## 5. Step 4: sign-off on the canvas

Nothing is built from an unsigned prototype. Two signatures, kept apart:

```
SIGN-OFF   <product>, prototype v<n>, <date>

Prototype         <location from the prototype record>, version
Identity          charter v<n>, tokens v<n>, signed on <date>  (step 2 record)
Owner             <name and role>, <date>, signed | refused
Design authority  design-director, <date>, signed | refused
                  (checks the prototype against the signed charter, and the
                  intentionality standard of design-authenticity)
Accepted states   <the states shown, as signed>
States owed       <carried from the prototype record, each with its owner>
Differences       <each canvas value that differs from the signed tokens,
                  and the decision: canvas corrected | brand-identity reopened>
If refused        <page or element>: <the decision still owed, concretely>
```

`design-director` signs the design against the charter; the owner signs that
it is what they want. Neither stands in for the other, and the agent that
filled the canvas signs nothing.

A canvas difference from the signed tokens is decided here, one of two ways:
the canvas is corrected to the token, or the identity is reopened through
`brand-identity` and a new sign-off. A canvas value never becomes a token by
being signed on the prototype.

Blocks step 5: a missing signature, or a signed version that is not the version
in the prototype record. If the canvas changes after sign-off, the changed
pages are signed again.

## 6. Step 5: tokens synced to the code

The mapping from palette roles to `--cu-*` names is in
`brand-identity/resources/token-handoff.md` section 3, and its three routes
into the code are in section 4. This step does not restate them; it adds who
does what.

```
design sync   the owner starts /design-sync, which runs the DesignSync tool
              to keep a claude.ai/design design-system project and
              libraries/ui in step, one component at a time. The agent never
              starts it, and never calls the DesignSync tool on its own
              initiative. After it runs, ui-ux-engineer compares every synced
              value with the signed token file.
by hand       sync unavailable or not chosen: ui-ux-engineer applies the
              values from the signed token file, never from the prototype's
              CSS, as one change under design-system
target        libraries/ui/src/tokens/tokens.css for the suite's library, or
              the project's own copy of those tokens (a project owns its
              copy); for a site template instance, the theme block of the
              content file (site-template-generation section 5)
```

Whatever the route, the result is a diff:

- every changed token, its old value, its new value, and the line of the
  signed token file it comes from;
- reviewed under `code-review-protocol`, with `design-director` confirming the
  values match the signed record;
- `npm test` in `libraries/ui` run and observed when the library's tokens
  changed;
- a role the library has no token for (a focus colour, a control edge) raised
  as a `design-system` finding, never hardcoded in a component.

Gate: every synced or applied value equals the signed token file.

Blocks step 6: any difference. The signed record wins; a synced value that
differs is reverted or reported to the owner, and is not treated as signed
because a tool wrote it.

## 7. Step 6: the site is built from the prototype

```
owner       site-template-engineer for a portfolio, a showcase or a
            dashboard (site-template-generation); frontend-engineer for any
            other site or product surface (frontend-engineering)
before      validation-gate passed: no production code, scaffolding
            included, before it (AGENTS.md, mandatory gates)
input       the signed prototype and its record, the synced tokens, the
            approved copy, the states owed with their designs
artefact    the site, its tests run and observed, and for a template kind
            the completion gate report of site-template-generation
```

The prototype is a reference, read for structure: section order, hierarchy,
grid and alignment, spacing rhythm, type roles, the states it shows, the
content order. It is never pasted in wholesale, because its markup:

- carries literal values instead of tokens, which the template forbids
  (site-template-generation section 1, design-system section 9);
- was not written to the accessibility contract: roles, names, focus order,
  reduced motion;
- is not wired to the content contract or the back office;
- may carry copy that is not the approved copy.

A fragment may be adapted when it is rewritten to the project's components and
tokens and reviewed as new code. Values come from the token file, copy from
the content file or the approved copy, never re-read from the prototype.

Every rule of the build still applies: the five UI states of
`frontend-engineering`, section 12 of `site-template-generation` for a template
kind, `accessibility-testing` on the rendered result, the evidence rule for
every fact on the page. Where the prototype and an accessibility rule
disagree, the rule wins and the difference is recorded for step 7.

Gate: `code-review-protocol` with a test run and observed; for a template
kind, the twenty nine point gate, or the dashboard gate.

Blocks step 7: a failing review or gate.

## 8. Step 7: design verification

```
owner       design-verification compares and reports; it does not fix
decides     design-director for a design deviation; the owner when it
            changes something they signed
input       the rendered build in a real browser (playwright-automation),
            the signed prototype and its record, the signed token file
artefact    the drift record below
```

What is compared, at the viewports and themes the prototype record lists:

| Aspect | How it is compared | Tolerance |
|---|---|---|
| Token values | the custom properties the browser resolves, read on the rendered page, against the signed token file | none: equal, or a defect |
| Colour and contrast | the rendered pairs measured in the browser, both themes | none below the thresholds of `brand-identity` section 5 |
| Typography | family, scale step, weight and line height per role | the same token step; rendering differences between engines are not drift |
| Spacing and layout | section order, grid, alignment, gaps | the same spacing step; a gap off the scale is a defect |
| States | every state the prototype shows, plus every state owed | each present; a missing state is a defect |
| Responsive | each viewport in the record, and 360px | the same structure; no horizontal scroll |
| Motion | what moves, and that reduced motion is honoured | reduced motion: none; otherwise the same intent |
| Content | the copy against the approved copy and the evidence rule | none: an invented fact is a truthfulness defect |

A pixel diff between the canvas and the browser is evidence, not the verdict:
the two render differently. The comparison is by token, structure and state.

Each difference is recorded:

```
DRIFT   <id>, <date>

Where           <page>, <viewport>, <theme>, <element>
Prototype       <what the signed prototype specifies>
Build           <what the rendered page shows>
Class           defect | deviation | prototype error | accessibility |
                truthfulness
Decision        fix | accept | reopen the identity
Decided by      design-director | the owner | not negotiable
Fix owner       frontend-engineer | site-template-engineer | ui-ux-engineer
Re-verified     <date, and the observed result>
```

Who decides what:

- An accessibility failure or a truthfulness defect is not negotiable: it is
  fixed, and nobody may accept it.
- A token value differing from the signed file is a defect: fixed in the
  build, never accepted as a new value.
- A deviation of intent (an alignment, an emphasis, a crop) is decided by
  `design-director`: fix, or accept with a reason.
- A deviation that changes what the owner signed goes to the owner.
- A prototype error (the canvas itself fails contrast, or shows a state that
  cannot work) is decided by `design-director`; a palette change goes back
  through `brand-identity`.

Gate: no open defect, every deviation decided and recorded, every fix
re-verified in the browser.

Blocks step 8: any open accessibility, truthfulness or token defect.

## 9. Step 8: production verification, then delivered

```
deploy      devops-engineer, within the delegation section of the
            configuration; deployments is no by default, so the deployment
            is prepared and handed to the owner with its command
verify      release-engineer runs production-verification against the
            deployed version
artefact    the production-verification report
```

Nothing is called delivered before `production-verification` passes: a real
request served correctly by the deployed version, not a successful deploy
command. For a site from this path, the checks include the pages rendering in
both themes, the resolved token values on production equal to the signed ones
on a sample of pages, and the contact form reaching its inbox where there is
one.

Social posts stay a handover. `community-manager` drafts them and hands each
one over with the record of `social-content` section 10, with its exact
content and the owner's action. No agent publishes, schedules or replies from
a real account; the `delegation` section has no publishing field.

Then `client-handover`, with the signed charter, token and prototype versions
recorded in the project's continuity notes.

## 10. Failure modes

| Failure | What it looks like | What to do |
|---|---|---|
| Unsigned tokens | a prototype or a build uses values from a draft identity, or a value "nobody objected to" | stop at the step reached; return to step 2 for the sign-off of `brand-identity` section 12; rebuild nothing until it is signed |
| Canvas and repository diverge | the canvas shows a colour, a step or a page the signed token file or the build does not have, or the canvas was edited after sign-off | the signed record wins; list each difference; `design-director` decides canvas corrected or identity reopened; changed pages are signed again at step 4 |
| Prototype markup copied | inline styles, literal colours, generated class soup or missing roles in the build, traced to the bundle | a defect at review; rewrite to the project's components and tokens; re-run the kind's gate and step 7 |
| Sync run by an agent | `/design-sync` or the DesignSync tool started without the owner | revert what it wrote; report it to the owner with the diff; the owner decides whether to run it; the values are checked against the signed file either way |
| A figure invented in copy | a statistic, a client count, a testimonial or a date with no source, on the canvas or the site | a truthfulness defect, not a taste note; remove it or replace it with a visible `[TO CONFIRM: ...]` marker; `implementation-integrity`; the owner supplies the fact or it stays out |
| Generation claimed | a prototype drawn by the agent presented as the canvas's generation, or the reverse | correct the prototype record's mode; no gate is passed on a misattributed artefact |
| Owner link unreadable | the claude.ai/design link fails to open | report the error to the owner; ask for a new link or move to mode a or c; never reconstruct the design |

## 11. Checklist

```
[ ] 1  brief validated; positioning, audience, constraints present
[ ] 2  charter and token file signed by design-director, never the drafter
[ ] 2  editorial line and copy passed document-core, or marked provisional;
       every fact sourced or marked [TO CONFIRM: ...]
[ ] 3  prototype record complete, mode stated, values checked against the
       signed token file
[ ] 4  owner and design-director signatures on the version in the record
[ ] 5  /design-sync started by the owner, or tokens applied by hand; the
       diff reviewed; every value equal to the signed file
[ ] 6  validation-gate passed before the build; prototype used as reference,
       no markup pasted; code-review-protocol with tests run and observed;
       the kind's gate passed
[ ] 7  drift record closed: no open defect, every deviation decided,
       fixes re-verified in the browser
[ ] 8  production-verification passed on the deployed version; posts
       handed over, none published
[ ]    every step not applicable recorded with its reason
```
