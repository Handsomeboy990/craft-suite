# Changelog

Every notable change to this project is recorded here. The format follows
semantic versioning.

## 3.20.0

Client sites, delivered as templates rather than as pages. One skill, one
agent, and two reference implementations that build and export.

### Added

- `site-template-generation` in `dev-skills`. Builds a client website as a
  fixed template driven by an external content file, so the site can still be
  changed a year after delivery without a developer. It fixes the content
  contract per kind, portfolio for a person and showcase for a company; chooses
  the design tokens by trade rather than by taste, including a motion intensity
  that separates an energetic profile from a technical one without a second
  template; states which fields the client may edit and verifies each one is
  actually wired, because a field promised in the handover and not connected is
  the defect the client finds first; and assembles the legal pages from the
  company's real facts, rendering a visible marker for every fact not provided
  rather than inventing a registration number under the client's name. A clause
  that binds is the client's own text or a marker: the template never drafts
  one. Accessibility and responsive rules are applied while building, and a ten
  point gate decides whether the template is finished.
- `site-template-engineer` in `agents/development`. Scaffolds a template from a
  trade and a kind, holds the gate, and hands over the field map. Thin, as every
  agent here is: the expertise is in the skill.
- Two reference implementations under the skill's `examples/`, both with
  clearly fictional data and no photograph of any real person: a one page
  portfolio for an invented sports coach, motion intensity 0.9, two legal pages;
  and a multi page showcase for an invented electrical company, motion intensity
  0.25, four legal pages, quotation form. Both build and export statically, both
  refuse a removed required field by name, and the showcase refuses to build
  when a legal page its kind requires is missing.
- The `SITE_TEMPLATE` task category, with its classification row, its routing
  phrases and its execution plan.

### Decided

- The palette carries two border tokens rather than one. Measuring the contrast
  of the two reference palettes, as the skill demands, failed on exactly one
  pair: the border, at 1.41 and 1.55 against its surface. Raising a single token
  to 3:1 would have fixed an input boundary and made every card separator loud.
  `border` is now decorative with no minimum, `borderStrong` draws the boundary
  of a control and is measured at 3:1, and both references reach every required
  ratio. The measured figures are in each reference README.

## 3.19.0

A documentation audit found that the one document a new user needs did not
exist, and that a set of counts and claims had drifted away from the
repository. Fixing the claims surfaced four bugs in `install.sh` that the prose
had been describing as if they were not there.

### Added

- `documentation/usage.md` and `documentation/usage.fr.md`. The suite had
  eleven documents describing what it contains and none describing what to do
  with it. The guide covers what runs these skills at all, what the install
  leaves on disk, how a skill is actually selected (the `description` field the
  host matches against, which nothing else here explained), the routing table
  by kind of request, what the gates demand, when not to use an agent, what to
  check, and what the suite does not do.
- `docs/README.md`, stating the boundary the repository had never written down:
  `documentation/` is usage, `docs/` is design reasoning and history.
- A `Configuring` section in `documentation/installation.md`. The only document
  titled Installation contained no occurrence of `--configure`, so a reader who
  followed it end to end finished with an unconfigured suite.
- The `delegation` section of `documentation/configuration.md`, which had zero
  occurrences of the word although `documentation/README.md` advertised it. The
  eight fields, what each value changes, and where the manual task list is
  written.

### Fixed

- `install.sh --configure` destroyed data. The configuration was written
  through a plain redirect, so every section the installer does not ask about,
  `model_routing` and `career`, was deleted on each run, and every managed
  field whose question the scope did not ask was written back empty:
  `--dev --configure` after `--all --configure` emptied `documents.page_size`,
  `documents.date_format` and `language.creative_output`. Unmanaged sections are
  now carried through verbatim and managed fields are seeded from the file
  before the first question. `config/README.md` and `documentation/configuration.md`
  claimed this was already true.
- `install.sh` resolved `depends_on` for `--skill` only, never for a tree or a
  category. `security/security-assurance/vulnerability-assessment` declares
  `security-audit`, which lives in the engineering tree, so `--security`
  installed a skill without the skill it refers to, against the guarantee
  `documentation/plugins.md` stated. The closure now runs for every selection.
  `--security` installs 18 rather than 14, and the security bundle carries
  `security-audit`, `engineering-core`, `project-exploration` and
  `input-validation`. Removal is unchanged and still never takes a skill
  another tree may be using.
- `install.sh` counted the cross domain pair twice when `--skill` and `--group`
  were combined, because deduplication compared path strings and the two code
  paths spelled the same directory with and without a trailing slash. The
  installer reported 14 where `installation.md` correctly promised 12.
- `install.sh --research` created an empty `~/.claude/agents` and reported
  `0 agents installed`: the research domain carries no agent. The directory is
  now created only when there is something to put in it.
- `install.sh --help` did not list `--port`, `--no-browser` or `--json`, which
  the argument parser accepts, and its header said the security tree holds 10
  skills.
- `documentation/installation.md` told the reader to `git switch dev`, gave
  `<repository-url>` and `<raw-url>` in place of the real URLs, said `--zip`
  alone prints the help when it opens the menu, listed six dependency-free
  skills when there are nine and named one that has a dependency, said
  dependency resolution crosses trees while giving an example that crosses only
  categories, and gave post-install counters of 75, 155 and 16 against real
  values of 84, 166 and 25.
- `docs/agents/README.md` listed `source-of-truth`, `checkup`, `final-verifier`,
  `design-research`, `design-verification` and `compliance` as not yet built.
  All six are shipped, and `docs/architecture/AGENT_ARCHITECTURE.md` listed
  three of them as missing in one paragraph and as delivered in the table below
  it.
- `documentation/agents.md` was titled "The seventeen" over a sixteen-row table
  describing a twenty-five agent roster. Regenerated from `agents/README.md`.
- `documentation/plugins.md` gave a transitive-resolution example that was
  false: the security bundle carries neither `security-audit` nor
  `security-testing` as claimed. It now names the one dependency that really
  crosses a tree. `documentation/overview.md` repeated the same claim.
- Counts corrected against the filesystem: the security tree said 10 in
  `README.md`, `README.fr.md`, `install.sh`, `plugins.md` and both overviews;
  `craft-engineering` said 70 in `plugins.md`; `dev-skills` said "Fifty four"
  over a table of 55; the agent total said 14, 16 or 17 in
  `documentation/README.md`, `tests/README.md`, `engineering-system.md`,
  `skills-guide.md`, `SKILL_AGENT_MATRIX.md` and both French passages of
  `overview.fr.md`.
- `security/secure-development/README.md` said "Eight skills" and omitted
  `rate-limiting` from its table entirely, although the skill was delivered,
  routed by `skills-guide.md` and listed by `security/README.md`.
- `engineering/devops-skills/README.md` listed 12 rows in its "What each skill
  refuses" table for 16 skills.
- The plugin tables now carry two columns, the tree count and what the bundle
  actually holds, because they answer different questions and mixing them is
  what let the numbers drift apart.

### Changed

- `tests/validate-counts.sh` covers what it previously declared out of scope:
  the plugin tables, measured on `plugins/<domain>/skills` rather than on the
  tree; the per-scope verification table; the `AGENTS.md` tree table; the count
  written in words at the top of each category index; and the agent total
  wherever it is spelled out. It also fails when an agent named under "What is
  not yet built" exists as a file. Each new check was verified by breaking the
  value it guards and observing the failure.
- `tests/validate-structure.sh` fails when a skill is absent from the index of
  its own category. This is the check that would have caught `rate-limiting`.
- `CONTRIBUTING.md`'s pre-pull-request checklist names what
  `validate-counts.sh` does and does not cover, rather than only the two
  totals.
- The three `## Validation` blocks in the engineering category indexes listed
  three scripts when `tests/` holds six.
- `README.md` and `README.fr.md` no longer claim the repository has no
  dependencies: the Control Center listed underneath them is Python.

## 3.18.0

Roadmap Phase 5, the last item: agent-level detections in the advisor, with
their limits stated rather than glossed.

### Added

- Three agent-dispatch detections in `control-center/advisor.py`:
  `agent-fan-out` (the same agent dispatched four or more times in one session,
  medium at eight), `agent-on-light-session` (a dispatch in a session that
  produced under fifteen thousand work tokens), and
  `dispatch-without-recorded-work` (informational, because a missing subagent
  transcript can mean the records are not on this machine rather than that the
  work never ran). Their thresholds are published with the others, so every
  finding stays reproducible. EN and FR templates for the three in the Control
  Center.

### Note on what this can and cannot show

The roadmap asked for a detection of an agent used where a lighter skill would
have done, or a model tier stronger than the classification justified. The
telemetry records which subagent ran, under which model, how often, and whether
dispatched work left a record. It does not record the task's complexity, nor
what a direct action would have cost, so neither of those can be proven from it.
The detections therefore report measurable dispatch patterns and, like every
other finding in the advisor, never assert that a pattern caused waste. This
limit is written into the module next to the thresholds.

### Verified

- `test_advisor.py` goes from 26 to 37 checks, each isolating one signal;
  `test_reader.py` still passes its 74. On the real transcripts the new
  detections stay silent, which is the correct result: the data shows none of
  these patterns, and the advisor never invents a finding.

## 3.17.0

Roadmap Phase 6, the documents demonstration: the documents tree's missing
worked example, and the reader rule shown rather than asserted.

### Added

- `documents/examples/jeu-conges/`: one fictional subject, an internal time-off
  system, written for three readers. A user guide (`user-documentation`), a
  technical manual and runbook (`technical-writing`), and a deployment report
  (`report-writing`), each passed through the eight-point gate. A fourth file
  records the gate report per document, the cross-set reader-split check, and a
  PDF render verification per `pdf-production`. `documents/examples/README.md`
  indexes it and `documents-system.md` section 10 points at it. The same fact
  (the two first-month incidents) appears in all three, formulated for each
  reader rather than copied, which is the reader split in practice.

### Method

- Produced through a multi-agent workflow: one writer per reader following its
  skill and `document-core`, a gate review per document, and a cross-set
  critique that confirmed the reader split holds. The gaps the writers could
  not fill are marked `[a confirmer]`, never invented, per the evidence rule.

### Changed

- `validate-orchestration.sh` check 12 now skips directories under `documents/`
  that carry no `SKILL.md`, so an example directory is not mistaken for a skill
  that must declare `document-core`.

## 3.16.0

Roadmap Phase 6, the delivery demonstration: the proof the repository was
missing, the delivery process run end to end and kept as artefacts.

### Added

- `engineering/examples/delivery-link-shortener/`: a worked example of the
  fourteen delivery phases on one small application, a link shortener. Sized
  small per the sizing rule (phases 01 to 06 on a page, 07 the bulk, 08 to 14 on
  a page), it keeps the deliverable each phase produces and shows the four
  approval gates (02, 05, 10, 14) as explicit stops with a recorded answer,
  including the phases that end `not applicable` with a written reason. An
  `engineering/examples/README.md` indexes it, and `delivery-system.md` points
  at it as the worked example, the way `writing/examples/` keeps a saga.

### Changed

- Roadmap: the Phase 3 item to exercise the frontend agents on a motion task is
  ticked, done on the `lauret-chacha` portfolio (a real audit and a full
  reduced-motion-safe motion pass, shipped to that project's `main`). The
  Phase 4 item to exercise the full agent layer is marked partly done, the
  portfolio audit having dispatched three agents and produced real telemetry;
  the newer agents will run end to end in a future delivery.

## 3.15.0

Roadmap Phase 0: the count-consistency check, and the drift it caught the day
it landed.

### Added

- `tests/validate-counts.sh`: computes the real skill and agent counts from the
  filesystem, then checks the structured places the docs write those numbers
  (the tree diagrams, the category tables, the installer menus and the totals)
  and fails on any mismatch. Wired into the CI job as a sixth check. It does not
  parse free prose or the plugin bundle sizes, which are not a plain directory
  count; a check that matches nothing fails on purpose, as a signal the phrase
  was reworded.

### Fixed

- Live count drift the new check caught, all corrected: `delivery-skills`
  written as 10 in `engineering/README.md` (real 11), the security tree written
  as 10 in three menus (real 12), `security-assurance` written as 2 in three
  tables (real 3), the core agent group written as 6 in the architecture diagram
  (real 9), the agent total written as 16 in `engineering/README.md` and as 16
  in the French overview diagram (real 25), and the dev-skills section titled
  "fifty four" (real 55).

### Changed

- Documentation that named the test suite now says six scripts, not five.
- The engineering plugin description reads 24 role agents, matching what the
  plugin now carries after the per-domain split.

## 3.14.0

Roadmap Phase 5, second item: the Control Center agent panel, so the
agent-dispatch telemetry that was already collected has a place in the browser.

### Added

- An Agents tab in the Control Center (`control-center/app.html`): the dispatch
  total, the dispatched-work records, and the breakdowns by agent and by model,
  read from the local transcripts. When the layer has not been exercised it
  shows a measured zero, not a gap, in keeping with the tool's rule that a
  figure it did not measure is never shown. EN and FR strings for every label.

### Changed

- The report's data-limitation note no longer says the agent-dispatch telemetry
  is collected but undisplayed; it now points at the Agents tab. The evolution
  document is updated to match. No backend change: the panel reads the
  `agent_dispatches` object `reader.py` already produced.

## 3.13.0

Roadmap Phase 5, first item: per-domain agent packs, so a domain's plugin is
self-contained rather than bundling every agent in the engineering one.

### Changed

- Agents now install with the domain that owns them. The security plugin
  carries `security-engineer` and `web-auditor`; the engineering plugin carries
  its 24-agent delivery team, which keeps `security-engineer` because its
  delivery flow dispatches it. `web-auditor` moved out of the engineering
  bundle: it is a security-only tool with no role in the engineering sequence.
  Previously `--security` installed the `website-audit` skill but not the
  `web-auditor` agent; now it installs both.
- `install.sh` gained an `agent_domains` mapping and a domain-filtered `agents`
  function; `--agents` still installs the whole 25-agent roster. `plugins/build.sh`
  builds each domain's own agents and drops the empty `agents/` directory for a
  domain that owns none.
- `validate-plugins.sh` check 4 now regenerates and compares each domain's
  agents against its bundle, replacing the check that only counted the
  engineering plugin's agents.
- Stale agent counts in the installer help and menus corrected: they read 16
  where the roster is 25. Engineering-scoped figures are now 24, the full
  roster 25.

## 3.12.0

Roadmap Phase 4, the verification layer: the three agents that hold a project
to the truth of its own code, before intervention and before it is called done.

### Added

- `source-of-truth` agent (`agents/core/`): the authority on what is actually
  true about a project. It treats the code, the schema and the running
  configuration as ground truth, reconciles the documentation, README, comments
  and continuity notes against them, and when they disagree, says so with
  evidence and records the canonical answer. It adjudicates truth and detects
  drift; it does not rewrite the prose, which it hands to `documentation-engineer`.
- `checkup` agent (`agents/core/`): the pre-intervention inspection. It reads an
  unfamiliar or inherited project and reports the architecture as built, the
  debt and fragile areas, the risks of intervening, and which boundaries are
  safe to change against those that are load-bearing. It changes nothing and
  surfaces where a full audit is warranted rather than running each one.
- `final-verifier` agent (`agents/core/`): the independent, evidence-only final
  gate that trusts no previous agent. It re-runs the proof, the tests actually
  pass, the review actually happened, the acceptance criteria are actually met,
  the change actually builds and runs, rather than reading a claim of it, and
  issues one verdict. A gate that only another agent asserts is unverified.

### Changed

- Counts: 22 to 25 agents, the `core` group 6 to 9. Skills unchanged at 166.
  Engineering plugin bundle rebuilt to carry the three new agents. Historical
  entries left as written.

### Not done yet

- The Phase 4 item to exercise the full agent layer on a real task remains open,
  alongside the Phase 3 motion task: both need a target project to run in.

## 3.11.0

A design capability requested before Phase 4: finding clean templates that fit
a project, rather than starting from a blank page or a bad one.

### Added

- `template-selection` skill (`engineering/dev-skills/`): finds clean,
  licence-clear templates that actually fit a project, shortlists a few with
  their trade-offs for the user to choose, confirms the chosen template's
  licence before use, and hands it to customisation. It understands the project
  first, because "templates that resemble the project" is meaningless without
  it; searches legitimate sources only; judges each candidate on fit,
  cleanliness with `design-authenticity` so a vibe-coded template is not called
  clean because it looks modern, licence, quality and the real cost, which is
  customisation not download; never decides for the user; never uses a template
  against its licence; and never ships one unchanged, because a template shipped
  as-is is the generic default a real product should not have. Depends on
  `engineering-core`; run by the `design-research` agent and `ui-ux-engineer`.

### Changed

- `template-selection` wired into the FRONTEND and UI_UX execution plans as a
  conditional step that runs only when the build starts from a template, and
  hands the chosen one on for customisation.
- Counts: 165 to 166 skills, dev-skills 54 to 55, engineering 81 to 82. Agents
  unchanged at 22. Historical entries left as written.

## 3.10.0

Roadmap Phase 3, the design-research role. The animation skill and its
reference analysis already landed; this adds the agent that turns real
references into principles without turning them into stolen code.

### Added

- `design-research` agent (`agents/design/`): searches and inspects legitimate
  references, a live site, a template, a design system, and extracts the
  layout, typography, interaction and animation patterns worth reusing, keeping
  reference, inspiration, pattern and implementation strictly apart. It reads a
  page and where useful its bundle to learn how an effect is achieved, states
  the principle, and never copies the code or the assets; the result built from
  what it finds is original. It judges a reference with `design-authenticity`,
  an intentional one to learn from, a generic-default one as a warning of what
  to avoid, and hands direction to `ui-ux-engineer` and `frontend-engineer`
  rather than implementing.

### Changed

- Counts: 21 to 22 agents (design group 2 to 3). No new skill: the agent cites
  skills that already exist. Historical entries left as written.

### Not done yet

- The Phase 3 item to exercise the frontend agents on a real motion task
  remains open: it needs a target web project to build in.

## 3.9.0

Roadmap Phase 2: the highest-value new capability, and the small skill that
explains a common mystery.

### Added

- `llm-integration` skill (`engineering/dev-skills/`): builds a feature on a
  language model around the three facts that a model is non-deterministic,
  costs money per call, and states a wrong answer as confidently as a right
  one. The prompt and a structured output as a contract, an evaluation set that
  gates every prompt or model change, retrieval that grounds a factual answer
  or an honest do-not-know, cost and latency budgeted at the real price,
  streaming and timeouts, and guardrails against prompt injection, a leaked
  system prompt, hallucination, truncation and cost abuse, with privileged
  actions gated outside the model. Reads the provider's current API rather than
  coding a model, limit or price from memory. Wired into the BACKEND plan.
- `email-deliverability` skill (`engineering/devops-skills/`): gets a sending
  domain's mail into the inbox instead of the spam folder or the void. SPF,
  DKIM and DMARC aligned to the visible From domain, DMARC rolled out from
  monitor to reject on the evidence of its reports rather than switched hard,
  transactional mail separated from marketing, a warmed sender, bounces and
  complaints suppressed, unsubscribe honoured, and the records and inbox
  placement monitored. The reason a confirmation email never arrives is usually
  here, not in the code that sent it. Wired into delivery phase 09.

### Changed

- Counts: 163 to 165 skills, 53 to 54 dev-skills, 15 to 16 devops-skills, 79 to
  81 engineering. Historical entries left as written.

## 3.8.0

Roadmap Phase 1: the three skills the original brief named and never got built
in their own right. Each was only covered in pieces inside other skills; now
each is owned.

### Added

- `rate-limiting` skill (`security/secure-development/`): a limit per endpoint
  by what abuse of it costs, not one number everywhere. Login, one-time codes
  and password reset tighter than a read; uploads, search and expensive
  operations by resource cost; keyed by IP, by user, or by both, unforgeable
  behind a proxy; the right algorithm; a shared store when more than one
  instance serves, or the real limit is a fraction of the stated one. Returns
  429 with Retry-After, leaks no account existence, and sits over the real
  control, not instead of it.
- `tls-certificates` skill (`engineering/devops-skills/`): the certificate over
  its whole life, obtaining, installing on the terminating layer, enforcing
  HTTPS with a redirect and HSTS, renewing automatically with margin and
  proving the renewal ran once, monitoring the expiry from outside on every
  hostname, and keeping the private key out of the repository, the logs and
  the image layers. Wired into delivery phase 09.
- `admin-console` skill (`engineering/dev-skills/`): the privileged back-office
  built as the highest-value target it is. Least-privilege roles rather than
  one god role, authorization on the server at the object level, an
  append-only audit log of who did what to whom, no secret rendered in the
  interface, hardened access, and operational controls that are themselves
  audited privileged actions. Wired into the FULLSTACK plan.

### Changed

- Counts: 160 to 163 skills, 11 to 12 security, 8 to 9 secure-development, 14
  to 15 devops-skills, 52 to 53 dev-skills, 77 to 79 engineering. Historical
  entries left as written.

## 3.7.0

Motion that is intended, not defaulted. A page that animates everything on
hover is generated, not designed, and `design-authenticity` already flags that.
This adds the skill that builds the other kind, taught in part from a reference
analysis of a real, well-made site.

### Added

- `animation` skill (`engineering/dev-skills/`): decides whether an interface
  should move at all, then picks the lowest sufficient technique, a CSS
  transition, a CSS keyframe, a scroll-driven animation, a JS library, or a
  WebGL shader for one signature moment, animating only the compositor-cheap
  `transform` and `opacity`, easing on chosen `cubic-bezier` curves, and
  building a `prefers-reduced-motion` path for every motion as a hard
  requirement rather than an afterthought. Wired into the FRONTEND, UI_UX and
  DESIGN_SYSTEM plans.
- `resources/reference-analysis-pear.md`: a worked analysis of a real site
  (`pear.no`), read from its public page and bundle: a bespoke WebGL shader
  layer for a signature moment, scroll-linked transform motion, masked
  reveals, custom easing, reduced motion honoured in both CSS and JS, on a
  designed typographic foundation. The principles are extracted, never the
  code or the assets; reference, inspiration, pattern and implementation are
  kept distinct.

### Changed

- Counts: 159 to 160 skills, 51 to 52 dev-skills, 76 to 77 engineering skills.
  The architecture tree's devops subtree, which still read thirteen after the
  workflow-automation addition, was corrected to fourteen. Historical entries
  left as written.

## 3.6.0

Two roles for the pull request itself: one that opens it, one that reviews it.
The suite already had the skills, `git-workflow` for the commit and the
request, `code-review-protocol` for the diff. This adds the agents that own
those two ends of a pull request as distinct roles, so the one who packages a
change is never the one who passes it.

### Added

- `pr-author` agent (`agents/core/`): packages finished, verified work into a
  pull request. Atomic commits with the configured identity and no tool
  attribution, a branch off the integration branch, a description whose
  validation section quotes commands that were actually run, the correct base.
  It packages and opens; it does not write the feature, and it does not approve
  or merge its own request.
- `pr-reviewer` agent (`agents/core/`): the independent review and mergeability
  gate. Reads the diff for correctness, security, tests and conventions, checks
  the repository merge criteria, the required check green, the base correct, no
  tool attribution, counts consistent, and issues a verdict with evidence. It
  does not merge, it does not review a request it authored, and it never passes
  a request with a red required check or an open security finding.

### Changed

- Counts: 19 to 21 agents, in current-state prose. No new skill: both agents
  cite skills that already exist. Historical entries left as written.

## 3.5.0

Workflow automation, opt-in and honest about its connector. Some projects want
a layer of automation that does not belong in the application, a nightly
export, a webhook that fans out, a message when an order fails, and a workflow
engine such as n8n does that. This adds the skill that builds those workflows
cleanly, starting from two refusals: it does not assume a project wants
automation, and it does not pretend to have a connection it has not been given.

### Added

- `workflow-automation` skill (`engineering/devops-skills/`): builds
  automation workflows through an external engine reached over a connector,
  n8n over its MCP server being the concrete target. Automation is opt-in per
  project and recorded, never a silent default, because a workflow engine is
  an operational dependency nobody should acquire by accident. The n8n
  connection is configured and authorized interactively by the user, outside
  the skill: it detects whether the connector is present, explains what is
  missing when it is not, guides the user to the configuration step, and never
  simulates access. Every workflow it builds is idempotent, has real failure
  paths, bounded retries and timeouts, keeps no secret in its definition,
  verifies inbound webhook signatures, and is run and observed before it is
  called done. Wired into delivery phase 09; the n8n specifics are in
  `resources/n8n-connector.md`.

No agent was added: this is a capability the devops engineer and the
orchestrator use, not a role with its own boundary and handoffs, so a thin
agent wrapper would add nothing.

### Changed

- Counts: 158 to 159 skills, 13 to 14 devops-skills, 75 to 76 engineering
  skills, in current-state prose. The delivery-system devops table, which had
  long undercounted at eleven and omitted two skills, was corrected to the
  full fourteen. Historical entries left as written.

## 3.4.0

The website auditor. Give it a URL and it reports what is wrong with the site
behind it, front to back: rendering, performance, accessibility, design,
observable security posture, and, on an authorized target, what an attacker
could actually do. The whole thing turns on one line, drawn before anything
runs: the line between looking and touching.

### Added

- `website-audit` skill (`security/security-assurance/`): the method for a
  URL-driven audit. Passive observation, loading pages, following links,
  rendering the DOM, reading response headers, measuring performance, checking
  accessibility, runs on any public URL, because it does nothing a normal
  visit does not. Active testing, anything that probes for a weakness, changes
  state, or creates an account, runs only on a target the requester owns or is
  authorized in writing to test, delegating to `vulnerability-assessment` and
  `authorized-pentesting`. Getting an authenticated session is the most
  sensitive step and the human holds it: if an account must be created, the
  audit stops, asks which email to use and whether verification is required,
  and waits for the requester to complete it. It never automates around a
  verification step, and never concludes a site is secure.
- `web-auditor` agent (`agents/security/`): runs the audit, keeps passive and
  active strictly apart, and hands every registration and verification step
  back to the requester. It audits and reports; it does not fix.

### Changed

- Counts: 157 to 158 skills, 10 to 11 security skills, 2 to 3
  security-assurance skills, 18 to 19 agents, in current-state prose.
  Historical entries left as written.

## 3.3.0

Design authenticity. There is a look a generated interface falls into when
nobody decided anything: the same violet-to-black gradient, frosted glass,
bento grid, default font, hover-everything motion, and the fabricated
testimonials and empty pricing tiers that travel with them. None is wrong on
its own; the cluster is, because it means the defaults were accepted rather
than chosen. This release adds the skill that detects that cluster and the
agent that runs it against a rendered page.

### Added

- `design-authenticity` skill (`engineering/dev-skills/`): the catalogue of
  generic-default tells across visuals, typography, motion and content, read
  as signals rather than verdicts. It never condemns a single element and
  never prescribes a replacement; it tests intentionality, whether a choice
  was made on purpose for this product, and names where intent is missing.
  One class of tell is not aesthetic at all: a fabricated testimonial, an
  invented metric, a checked feature that is not built, are handed to
  `implementation-integrity` as truthfulness defects and raised regardless of
  how well the rest of the page is designed. Wired into the UI_UX and
  DESIGN_SYSTEM execution plans.
- `design-verification` agent (`agents/design/`): checks a built interface
  against the design it was meant to be and against the defaults it should not
  have fallen into, inspecting the rendered page rather than the source. It
  verifies and reports, it does not redesign, and it fails a page that
  animates everywhere and honours reduced motion nowhere on accessibility
  grounds independent of taste.

### Changed

- Counts: 156 to 157 skills, 50 to 51 dev-skills, 74 to 75 engineering skills,
  17 to 18 agents, in current-state prose. Historical entries left as written.

## 3.2.0

The launch completeness gate. A user-facing web product carries deliverables
no test suite checks: a legally required privacy policy, a favicon and a
social preview so a shared link does not look broken, a custom error page, a
cookie banner where tracking demands one, and a security posture that holds
when a stranger, not the developer, makes the requests. This release
consolidates those into one gate that delegates to the skills that already
own each item and adds the web-launch items that fell between them.

### Added

- `launch-readiness` skill (`engineering/delivery-skills/`): the itemised
  checklist across eight domains (legal, discoverability, content,
  performance, accessibility, UX integrity, analytics, security posture,
  infrastructure), each item a deliverable with a verification and an owning
  skill. The full grid is in `resources/launch-checklist.md`; the concrete
  mapping for a Supabase and Next.js project, the stack it is most often
  written against, is in `resources/supabase-next-appendix.md`. The skill body
  stays stack agnostic. It never writes the legal text of a privacy policy or
  terms document: it scaffolds and verifies the page, and the wording, which
  carries liability, stays the owner's.
- `compliance-verifier` agent (`agents/core/`): runs the gate against a built
  or deployed product and reports, with evidence, which deliverables are
  present and working. It verifies and reports; it does not fix, so the check
  stays independent of the work. It never issues ready with an open security
  or legal blocker.
- The gate is wired into delivery phase 11, so a running system is not
  mistaken for a launch-ready product.

### Changed

- Counts: 155 to 156 skills, 10 to 11 delivery-skills, 73 to 74 engineering
  skills, 16 to 17 agents, wherever they appear in current-state prose.
  Historical entries in this file and in `CONTINUITY.md` are left at the count
  that was true when they were written.

### Not changed

- No existing skill changed. The security, SEO, accessibility, performance,
  privacy and backup depth the gate checks lives where it already lived; the
  gate runs those skills and records their results rather than restating them.

## 3.1.0

Phase 1 of the multi-agent architecture expansion: a routing core, added
without touching a single existing skill's content. Minor version: additive,
and nothing here is a breaking change to an installed suite.

### Added

- `task-complexity`: classifies a task into one of five tiers from eleven
  signals, combined by a highest-signal-wins rule, so a small change with a
  security or irreversibility signal is never under-classified by its file
  count. `engineering/dev-skills/task-complexity/`.
- `model-routing`: recommends a model tier, and where a lever exists an
  effort level, from that classification. States exactly which two switching
  mechanisms this runtime supports, an agent's own `model:` frontmatter and a
  per-dispatch override, and claims neither a session changing its own model
  mid task nor a universal per-agent effort control, because neither is
  verified to exist. `engineering/dev-skills/model-routing/`.
- `token-optimization`: the discipline for keeping context and output
  proportional to a task during a multi-step or multi-agent run, sharing one
  vocabulary of seven wasteful patterns with `control-center/advisor.py`'s
  retrospective measurement rather than defining a second one.
  `engineering/dev-skills/token-optimization/`.
- `model_routing` configuration section: three tier names, `fast`,
  `balanced`, `strongest`, resolved to real model identifiers by the project
  rather than hardcoded, because availability differs by account and changes
  over time.
- `tests/validate-model-routing.sh`: checks the routing table against eleven
  deterministic fixtures, five base tiers, four override conditions, two
  escalation and de-escalation transitions, with no live model call.
- Architecture documentation: `docs/architecture/multi-agent-assessment.md`,
  `AGENT_ARCHITECTURE.md`, `MODEL_ROUTING.md`, `TOKEN_OPTIMIZATION.md`,
  `SKILL_AGENT_MATRIX.md`, `ORCHESTRATION.md`, and `docs/agents/README.md`.

### Changed

- The sixteen agents moved from `engineering/agents/` to a repository-wide
  `agents/<group>/` tree (`core`, `development`, `design`, `security`,
  `testing`, `documentation`, `devops`, `research` reserved empty), so a
  future agent pack for a single domain does not have to live inside the
  engineering plugin. No agent's content changed; `git mv` used throughout,
  confirmed as renames rather than delete-plus-add.
- `engineering-orchestrator` now classifies and routes per plan step rather
  than once per request, and treats a reclassification and a routing
  escalation or de-escalation as the same event rather than three
  independent judgment calls.
- Skill counts corrected wherever they appear in prose: 152 to 155 skills, 47
  to 50 `dev-skills`, 70 to 73 engineering skills, four to five validation
  scripts, including in the CI workflow.

### Not changed

- No existing skill's `SKILL.md` content changed, apart from
  `engineering-orchestrator`'s protocol and anti-loop sections, which now
  reference the three new skills rather than restate them.
- No plugin's public skill set changed beyond gaining the three new
  `dev-skills`; the engineering plugin's agent bundle is unchanged in
  content.

## 3.0.0

The suite is renamed Craft Suite. The writing tree stopped being the whole of it
several versions ago, and the old name kept saying otherwise on every install
command, every plugin identifier and the front page. The README is also split:
a short entry point at the root, the long form moved under `documentation/`.

### Changed

- **Breaking.** The repository is `craft-suite`. GitHub redirects the old URL,
  so an existing clone keeps working, but the marketplace command is now
  `/plugin marketplace add Handsomeboy990/craft-suite`.
- **Breaking.** The seven plugins are renamed from `writer-suite-<domain>` to
  `craft-<domain>`. A plugin installed under the old identifier is not upgraded
  in place: remove it and install the new one.
- **Breaking.** The configuration file moves from `~/.claude/writer-suite.config.yaml`
  to `~/.claude/craft.config.yaml`, and the manual task list from
  `writer-suite-manual-tasks.md` to `craft-manual-tasks.md`. `install.sh` moves
  both on its next run, so an existing install keeps its answers and is not
  asked again. It only moves a file when the new name is absent, and does
  nothing when `CLAUDE_CONFIG_FILE` points somewhere of your own.
- The template is `config/craft.config.example.yaml`.
- The cache used by the piped installer is `~/.cache/craft-suite`.
- `README.md` and `README.fr.md` are now short entry points: what the suite is,
  how to install it, the seven plugins, what "finished" means, and where to go
  next. The previous long form is preserved unchanged at
  `documentation/overview.md` and `documentation/overview.fr.md`, with its
  relative links rewritten for the new depth.
- The Control Center window title reads Craft Suite.

### Not changed

- No skill content changed. The 152 skills and 16 agents are byte identical
  apart from the two files that named the configuration.
- The installer flags, the scoping behaviour and the four validators are
  unchanged.
- Historical entries below keep the old name, because that is what they
  describe.

## 2.3.0

Control Center evolution: a Token Optimization Advisor, richer and more honest
token analytics, session detail, filtering, English and French localization,
report export, and a UX, theme and accessibility pass. No new dependency; the
Control Center is still Python standard library and one HTML file.

### Added

- Token Optimization Advisor (`control-center/advisor.py`), a pure, deterministic
  module that analyses real session evidence and surfaces evidence-based
  opportunities: repeated file exploration, edit churn, repeated command shapes,
  low context reuse, several large outputs, an over-broad session, and a project
  re-explored across sessions. Each finding states what was observed, a
  recommendation, a concrete example and the potential benefit, with a severity.
  It never invents a finding: each detection has a documented threshold, and a
  session with no signal produces none. The optimization score is deterministic
  and explainable (each session starts at 100, findings subtract a documented
  severity penalty, the overall score is the mean), and null when there is no
  data rather than a misleading 100.
- An Optimization tab with the score ring and its method, recurring patterns, top
  opportunities diversified across categories, a per-session table, and the
  methodology with its thresholds.
- A session detail view: select a session to see its token components, evidence
  (reads, edits, commands) and its optimization findings.
- Report export in HTML, JSON, CSV and PDF. PDF uses the browser's own print
  dialog on a print-styled report, a genuine PDF with no external dependency.
  Reports state their period, sources, metrics, limitations and a privacy note,
  and carry aggregate statistics only, never raw transcript content.
- English and French localization, switched live and remembered per browser,
  English as the fallback. All user-facing strings, including advisor findings,
  are translatable; no translated string lives in analysis code.
- `control-center/test_advisor.py`, deterministic advisor tests with no
  test-framework dependency, covering empty data, clean sessions, every finding
  category, the below-threshold no-invention case, the scoring formula, the floor
  at 0, cross-session logic and determinism.
- `tests/check-app-js.py`, a page-script syntax check wired into CI, so a syntax
  error in the inline script cannot ship a blank page.
- `docs/control-center-evolution.md`, the architecture, data flow, advisor
  detection table, privacy model and the extension points for future telemetry.

### Changed

- Token analytics are more honest. The four real components (fresh input, cache
  read, cache creation, output) are shown separately; cache reads, which are the
  same context re-read cheaply each turn and sum to billions, are no longer folded
  into a single headline. Session sizes and the overview use work tokens (fresh
  input plus output), so figures are comparable. Overview adds median, largest and
  smallest sessions and a cache-reuse ratio.
- The Sessions tab gained search, project and date-range filters; the terminal
  `--report` gained an optimization summary and honest project figures.
- The theme is complete in light and dark with an explicit toggle and system
  default; localization and theme persist in the browser only.
- Accessibility: keyboard-operable tabs, rows and dialog, focus management,
  charts with a visually-hidden table alternative, and reduced-motion support.
- The CI runs the advisor tests, the page-script syntax check and the advisor
  CLI alongside the existing checks.

## 2.2.0

Four new domains, an optional local dashboard, and per-domain plugins. The
suite grows past writing without disturbing what existed: 121 skills to 152,
four trees to eight, and a second distribution path alongside the installer.
The product is repositioned as the Claude Skill Suite; the repository keeps its
name.

### Added

- `security/`, 10 defensive security skills in two categories, governed by
  `security-core`:
  - secure-development: `security-core`, `threat-modeling`,
    `security-architecture`, `authentication-security`, `authorization-design`,
    `session-security`, `dependency-security`, `security-headers`.
  - security-assurance: `vulnerability-assessment`, `authorized-pentesting`.
  - The posture is defensive; offensive technique lives only in
    `authorized-pentesting`, behind a written-authorization gate that is checked
    first and never waived by rephrasing. No audit concludes a system is secure.
  - The engineering tree's `security-audit` and `security-testing` stay where
    twelve execution plans call them; the security tree governs their posture
    and installs them with it.
- `research/`, 5 general research skills governed by `research-core`:
  `source-research`, `source-verification`, `competitive-analysis`,
  `synthesis-reporting`. A source is cited only if it was consulted; a gap is
  stated, not invented. Distinct from the writing tree's `research-director`.
- `career/`, 7 job search and application skills governed by `career-core`:
  `career-profile`, `job-search`, `cv-engineering`, `cover-letter`,
  `interview-preparation`, `company-research`. Nothing about the outside world
  is invented; nothing about the candidate is claimed that they cannot support.
  A new `career` configuration section carries the candidate's real situation.
- `opportunity/`, 9 skills in three categories governed by `opportunity-core`:
  ideation (`ideation-engine`, `idea-evaluation`), hackathons
  (`hackathon-discovery`, `hackathon-strategy`, `pitch-and-demo`), business
  (`client-discovery`, `lead-research`, `market-research`). One method: discover,
  evaluate, recommend a ranked few. Every opportunity is grounded or marked a
  hypothesis, never fabricated.
- `control-center/`, an optional zero-dependency local dashboard: a Python
  standard-library server and a single self-contained HTML page that read the
  real local session data, installed skills and configuration and show usage,
  tokens, models, tools, projects and system health. It binds to loopback only,
  keeps nothing of its own, and marks any metric it cannot establish as
  unavailable rather than inventing it. `bash install.sh --control-center`, and
  `bash install.sh --report` for the same figures in the terminal.
- Per-domain Claude Code plugins: `.claude-plugin/marketplace.json` and a
  manifest per domain, with bundles under `plugins/` generated from the trees by
  `plugins/build.sh`. `/plugin marketplace add Handsomeboy990/claude-writer-suite`
  then installs only the domains wanted.
- `tests/validate-plugins.sh`, a fourth validator that keeps the plugin bundles
  in sync with the canonical trees and checks the manifests.

### Changed

- The installer gained `--security`, `--research`, `--career`, `--opportunity`
  scopes, `--control-center` and `--report` modes, and a ten-option interactive
  menu. All scopes combine and deduplicate, and each pulls its cross-tree
  dependencies and the shared pair, exactly as before.
- The three existing validators learned the four new trees. Counts updated
  across `README.md`, `README.fr.md`, `AGENTS.md` and the documentation.
- Product name presented as Claude Skill Suite in the documentation and plugin
  manifests. The git remote and directory keep `claude-writer-suite`, so no
  clone URL, install command or existing link breaks.

## 2.1.0

Quality engineering as a system rather than a single skill, and the lifecycle
gaps closed: contracts, schemas, change management, asynchronous work, money,
files, locales, search, design language, privacy, infrastructure and
incidents. 92 skills to 121, 14 agents to 16, 20 task categories to 38.

### Added

- Quality subsystem, 9 skills in `dev-skills`:
  - `quality-engineering`: discovery, one batch of questions, the testing
    contract, strategy by product type, discipline selection, campaign order,
    the twelve point quality gate and one verdict.
  - `exploratory-testing`: charters, time boxes, nine tours, usability
    findings attached to reproducible behaviour.
  - `bug-hunting`: nine families of adversarial interaction, minimal
    reproductions with a stated frequency.
  - `api-testing`: the contract past the first 200, forty five endpoint cases,
    error shape coherence, idempotency and concurrency.
  - `regression-testing`: impact analysis from the diff, five selection tiers,
    baseline comparison, honest exclusion.
  - `accessibility-testing`: keyboard first, scanner last, criteria map,
    findings mapped to a barrier and a person.
  - `security-testing`: authorized dynamic verification inside a written
    boundary, role matrix, object level access, tenant isolation.
  - `reliability-testing`: nine failure modes per dependency, four properties
    per injection, injection at more than one point per operation.
  - `test-reporting`: finding records, severity scale, defect lifecycle,
    evidence and redaction, campaign report in Markdown or self contained HTML.
- Domain surfaces, 13 skills in `dev-skills`: `api-design`,
  `database-design`, `caching-strategy`, `background-jobs`,
  `realtime-systems`, `file-handling`, `payment-engineering`,
  `internationalization`, `seo-engineering`, `design-system`, `data-privacy`,
  `analytics-instrumentation`, `feature-flags`.
  - `analytics-instrumentation`: the questions before the events, a typed
    schema, identity without personal data, definitions in one register,
    consent, validation and deprecation.
  - `feature-flags`: flag types and their lifespans, fail safe evaluation,
    gradual rollout against a written threshold, both sides tested, stale
    detection, and the removal that closes the loop. An entitlement is
    authorization, not a flag.
- Change and continuity, 5 skills in `dev-skills`: `refactoring`,
  `legacy-code`, `migration-engineering`, `technical-debt`,
  `decision-records`.
- Operations, 2 skills in `devops-skills`: `infrastructure-as-code`,
  `incident-response`.
- Agents: `principal-engineer` for a multi surface request and its gates,
  `incident-responder` for a degraded production system and its postmortem.
- Eighteen task categories: QUALITY_CAMPAIGN, ACCESSIBILITY, REGRESSION,
  MIGRATION, LEGACY, INCIDENT, INFRASTRUCTURE, PAYMENTS, JOBS, REALTIME,
  FILES, I18N, SEO, DESIGN_SYSTEM, PRIVACY, CACHING, ANALYTICS,
  FEATURE_FLAGS, each with a canonical plan and routing rows.
- `AGENTS.md`, the vendor neutral entry point an agent reads first.

### Changed

- `testing-quality`: a requirement to case section before the mandatory cases,
  and a suite review section with `resources/test-suite-review.md`. Sections
  renumbered.
- `playwright-automation`: interactive browser CLI mode, console and network
  audits, recording and evidence rules, a failure diagnosis order, and
  `resources/playwright-cli-protocol.md`. Command surfaces are verified
  against the installed tool rather than reproduced from memory.
- Execution plans: `ARCHITECTURE`, `FRONTEND`, `FULLSTACK`, `DATABASE`, `API`,
  `SECURITY`, `PERFORMANCE`, `UI_UX`, `TESTING`, `BROWSER_AUTOMATION`,
  `RELEASE`, `REFACTORING` and `DEPENDENCY` extended with the new skills.
- Delivery phases 04, 08, 09 and 11 extended.
- Nine agent definitions now cite the skills that cover their new surfaces.
- `tests/validate-orchestration.sh`: 38 categories, 16 agents, and check 4
  encodes the one deliberate exception to the exploration first rule, since
  an INCIDENT plan restores service before it explores.
- `tests/validate-rules.sh`: check 7 fails the build if a runtime specific
  agent file, a local agent directory or a secret file is ever tracked, and if
  `AGENTS.md` is absent.
- `tests/validate-structure.sh`: `AGENTS.md` added to the required root files.

### Removed

- `CLAUDE.md` is no longer tracked. A file named after an agent runtime is
  machine local configuration; the entry point moved to `AGENTS.md` with the
  same purpose and a neutral name. `.gitignore` now covers `CLAUDE.md`,
  `.cursor/`, `.cursorrules`, `.windsurfrules` and `.aider*` alongside
  `.claude/`.

## 2.0.0

Two new trees, an English-first skill language, and a configuration system
with explicit delegation boundaries. The engineering tree keeps its content;
the writing tree keeps its expertise and changes its instruction language.

Breaking: skills are now written in English, `README.fr.md` is the French
entry point rather than `README.md`, and skills that read user specific values
now require the configuration file instead of embedded defaults.

### Added

- `shared/`: 2 cross domain skills, depending on nothing and callable from
  every tree.
  - `self-critique`: selects the professional roles that will receive the
    work, runs one pass per role, checks the result against what was actually
    requested, ranks findings by severity, fixes them, re-reviews what the
    fixes touched. Delegates depth to the domain reviewers and keeps the one
    check none of them performs.
  - `project-brief`: inspects what exists, asks the decision-critical
    questions once in a single batch, records an assumption for everything it
    did not ask, and produces the working agreement that becomes the
    operational source of truth. Covers taking over existing work.
- `documents/`: 7 skills for documents delivered to someone, in three
  categories.
  - `document-core`: the constitution. Audience model, the three languages,
    the evidence rule, the shared style standard, an eight-point quality gate,
    eleven when paginated.
  - `technical-writing`, `user-documentation`, `report-writing`: separated by
    reader, not by subject.
  - `administrative-writing`: letters, notices, attestations, minutes,
    applications, with country conventions and the evidence rule at its
    strictest.
  - `document-design`, `pdf-production`: layout, then rendering and its
    verification.
- `config/`: the configuration contract. Template, field reference, and the
  rule that identity values have no default and never will.
  - `delegation` section: commits, branches, push, pull requests, release
    tags, deployments, database operations, dependency changes. Anything the
    user keeps is prepared and handed over rather than performed.
  - `install.sh --configure`: recommendation-first numbered prompts, scoped to
    what was installed, with validation that refuses an author name resembling
    a tool.
  - Selective installation. `bash install.sh` with no argument now asks what
    to install instead of installing all 92 skills. A developer is not given a
    novelist's toolkit, and the reverse. Scopes combine, `--all` restores the
    old behaviour explicitly, and with no terminal and no scope the installer
    refuses rather than guessing.
  - `--skill <name>` installs one skill with its dependencies resolved
    transitively across trees, so a named skill is never installed broken. An
    unknown name stops the run instead of silently shortening it. A named
    removal takes only what was named, since dependencies are shared.
  - `--group <category>` installs one or more of the ten categories, so a
    thriller writer takes `genres` without the prosody skills. Trees,
    categories and named skills combine freely and the result is
    deduplicated.
  - `--list` prints every skill with its purpose.
  - The script bootstraps itself: with no skills beside it, it clones the
    repository into `~/.cache/claude-writer-suite`, which makes
    `curl ... | bash -s -- --writing` work. It opens the terminal directly for
    its questions, since its own stdin is the pipe.
  - `writer-suite-manual-tasks.md`, generated next to the configuration:
    every step the user kept, with its command.
- `README.fr.md`: complete French entry point, equivalent to `README.md`.
- `documentation/installation.md`, `configuration.md`, `agents.md`,
  `documents-system.md`, `branch-protection.md`.
- Repository governance. `dev` becomes the integration branch every
  contribution targets; `main` becomes the release branch, receiving only pull
  requests from `dev`.
  - `.github/CODEOWNERS`: the maintainer owns everything by default, with
    commented lines for adding authorized reviewers and per-area owners.
  - `.github/pull_request_template.md`: base branch check, the three
    validation results, and the attribution prohibition.
  - `.github/workflows/validate.yml`: runs the three scripts plus a shell
    syntax check on every pull request, and fails a pull request whose commits
    attribute the work to a tool. Meant to be a required status check.
  - `.githooks/pre-push`: refuses a direct push to `main` or `dev`, refuses
    their deletion, refuses a commit attributed to a tool, refuses a commit
    with an empty author. Enabled with
    `git config core.hooksPath .githooks`, with a documented maintainer
    override for a deliberate release push.
  - Branch protection applied to both branches through the GitHub API: pull
    request required, one approving review, code owner review required, stale
    approvals dismissed, `structure, rules, orchestration` as a required
    status check, branch up to date, conversations resolved, linear history,
    no force pushes, no deletions. `enforce_admins` deliberately off, so the
    owner keeps a release path while contributors are blocked.
- An Author section in both READMEs, and the copyright holder named in
  `LICENSE`.
- `validate-orchestration.sh` checks 12 and 13: the document pipeline, and the
  independence of `shared/`.
- `validate-rules.sh` checks 3 and 4: credential-shaped strings anywhere, and
  hardcoded personal identity in any skill tree.
- `validate-structure.sh`: duplicate skill name detection, since installation
  is flat.

### Changed

- Skill language is English for all 92 skills. The 42 writing skills were
  rewritten rather than translated: the structural expertise is unchanged, the
  French craft rules are retained and marked as French, and each skill states
  what happens when the output language is not French.
- Output language is now a configuration decision.
  `language.creative_output` defaults to French for `writing/`;
  `language.document_output` is set per recipient for `documents/`. The
  reference material in `writing/resources/` and the writing skills'
  `examples/` stays French, being output rather than instruction.
- `git-workflow`: the author identity is read from `identity.author_name` and
  `identity.author_email` instead of being hardcoded, and the skill stops and
  names the missing field rather than inventing one. New section 2 carries the
  delegation contract; the protocol reports every step stopped at.
- `install.sh`: rewritten in English, with `--documents`, `--shared`,
  `--configure` and `--help`. Cross domain skills install with every scope and
  survive a scoped removal.
- `validate-structure.sh`: group paths replace the tree-to-category mapping,
  covering four trees and ten groups; the `Protocol` and `Interfaces`
  requirement extends to `documents/` and `shared/`; skill README titles are
  checked for every tree.
- `validate-rules.sh`: rewritten in English. The straight quote check is
  scoped to `writing/`, since the rest of the repository is English where the
  straight quote is correct. `dist/` is excluded.
- `validate-orchestration.sh`: rewritten in English. Dependency and
  `Interfaces` resolution now spans all four trees.
- `README.md`, all tree and category indexes, `documentation/architecture.md`,
  `skills-guide.md`, `documentation/README.md`, `tests/README.md`,
  `CONTRIBUTING.md`, `CLAUDE.md`: rewritten in English.
- `CLAUDE.md` reduced to an entry point that points at the canonical
  documents instead of duplicating them, and records why it is committed.

### Fixed

- `documentation/architecture.md` carried a directory tree from before the
  1.3.0 reorganisation, showing categories at the repository root.
- `CLAUDE.md` carried the same stale tree.
- `git-workflow` and its resources embedded a real name and email address in a
  reusable skill, in `SKILL.md`, `README.md`, the pre-commit checklist and the
  worked example.
- `install.sh` used `GROUPS` as its skill group variable. `GROUPS` is a bash
  built-in array holding the current user's group ids, so the assignment was
  silently overwritten and every mode installed zero skills. Found by running
  the installer rather than by reading it. Renamed to `SKILL_GROUPS`, and all
  six modes re-verified against a sandbox target.

## 1.3.0

Reorganisation into two separate trees. No skill content changed; only paths.

### Changed

- Directory layout: the four writing categories, `resources/` and `examples/`
  moved under `writing/`; the three engineering categories and `agents/` moved
  under `engineering/`. The 392 files moved are pure renames and Git history is
  preserved.
- `README.md`: rewritten around the two trees, their categories, the minimum
  chains, the shared rules and the documentation table.
- `tests/validate-structure.sh`: resolves categories per tree, and now
  requires a `README.md` for each tree and each category.
- `tests/validate-orchestration.sh` and `install.sh`: paths adapted.
- `CLAUDE.md`, `CONTRIBUTING.md`, `CONTINUITY.md`, `documentation/*`,
  `tests/README.md`: paths prefixed with their tree.

### Added

- `writing/README.md` and `engineering/README.md`: tree indexes.
- `writing/core/README.md`, `writing/genres/README.md`,
  `writing/poetry/README.md`, `writing/quality/README.md`: category indexes,
  with order of use and a table of choice by situation. The four engineering
  categories already had theirs.

## 1.2.0

Extension of the engineering system into a full project delivery system. The
writing suite is unchanged.

### Added

- `delivery-skills/`: 10 project conduct skills, from specification to
  delivery, written in English.
  - `delivery-orchestrator`: fourteen phases, approval and verification gates,
    parallelisation, delivery checklist, verdict.
  - `requirements-analysis`, `clarification-gate`: understanding.
  - `technology-selection`, `architecture-proposal`, `validation-gate`:
    decision and approval.
  - `delivery-planning`, `implementation-integrity`,
    `scope-and-change-control`: execution.
  - `client-handover`: the takeover package.
- `devops-skills/`: 11 operations skills, platform agnostic.
  - `devops-core`, `environment-management`, `secrets-management`: foundation.
  - `containerization`, `ci-cd-pipelines`, `deployment-engineering`,
    `database-operations`: build and commissioning.
  - `observability`, `backup-recovery`, `production-verification`,
    `release-engineering`: operation.
- `agents/`: 14 specialised agent definitions and the handoff protocol. An
  agent cites skills; it copies none.
- `delivery-skills/delivery-orchestrator/resources/delivery-phases.md`: the
  fourteen phases in a machine-readable format, with their gates.
- `documentation/delivery-system.md`.
- Category indexes: `delivery-skills/README.md`, `devops-skills/README.md`,
  `agents/README.md`.

### Changed

- `tests/validate-structure.sh`: covers seven categories and 83 skills, and
  requires `Protocol` and `Interfaces` in the three engineering categories.
- `tests/validate-orchestration.sh`: from nine checks to twelve. Adds the
  fourteen delivery phases, the approval gates at phases 02, 05, 10 and 14, the
  fourteen agent definitions with their eight mandatory sections, and the
  skills cited by agents. Skill resolution now spans the three categories.
- `install.sh`: installs agents into `~/.claude/agents`, with `--agents` and
  `--no-agents`, and `CLAUDE_AGENTS_DIR` as a configurable target. Six modes
  verified.
- `CLAUDE.md`: three orchestrators and their scopes, the delivery workflow,
  the language of the new categories.
- `README.md`, `CONTRIBUTING.md`, `documentation/architecture.md`,
  `documentation/skills-guide.md`, `documentation/README.md`,
  `documentation/engineering-system.md`, `tests/README.md`, `CONTINUITY.md`:
  updated for the three new sets.

## 1.1.0

Addition of a second skill system, for software engineering. The writing suite
is unchanged.

### Added

- `dev-skills/`: 20 software engineering skills, stack agnostic, written in
  English.
  - Foundation: `engineering-core`, `project-exploration`,
    `engineering-orchestrator`.
  - Design: `architecture-design`, `ui-ux-engineering`,
    `dependency-selection`.
  - Implementation: `frontend-engineering`, `backend-engineering`,
    `fullstack-engineering`.
  - Verification: `input-validation`, `security-audit`, `debugging`,
    `testing-quality`, `playwright-automation`, `performance-engineering`,
    `code-review-protocol`.
  - Delivery: `technical-documentation`, `project-continuity`, `git-workflow`,
    `release-readiness`.
- `dev-skills/engineering-orchestrator/resources/execution-plans.md`: one
  machine-readable execution plan for each of the twenty task categories.
- `tests/validate-orchestration.sh`: nine coherence checks on the engineering
  system, including the five reference routing scenarios.
- `documentation/engineering-system.md`.
- `dev-skills/README.md`: index and reading order.
- `CONTINUITY.md`: state of the repository for whoever takes over.

### Changed

- `tests/validate-structure.sh`: covers the `dev-skills` category and
  requires, for it alone, a numbered `Protocol` section and an `Interfaces`
  section.
- `tests/validate-rules.sh`: the straight quote check ignores fenced code
  blocks, nested ones included. Warnings drop from three to one, the last being
  a deliberate typographic counter-example.
- `install.sh`: scope options `--writing` and `--dev`, combinable with `--zip`
  and `--remove`. Default installation of 62 skills.
- `.gitignore`: excludes local agent configuration and secret files.
  `CLAUDE.md` stays tracked, and the reason is written in the file.
- `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`,
  `documentation/architecture.md`, `documentation/skills-guide.md`,
  `documentation/README.md`, `tests/README.md`: updated for the second system
  and the third validation script.

## 1.0.0

Initial version.

### Added

- `CLAUDE.md`: project memory, permanent rules, conventions, workflow, Git
  rules, philosophy.
- `core/writing-constitution`: founding document, typographic prohibitions,
  French dialogue conventions, flashback handling, style, characters, cultures,
  self-critique thresholds.
- 13 further `core` skills: novel-architect, chapter-architect, scene-builder,
  narrator, dialogue-master, character-psychologist, world-builder,
  immersion-director, research-director, continuity-manager, timeline-manager,
  saga-architect, screenwriter.
- 15 `genres` skills: thriller, mystery, detective, horror, fantasy,
  dark-fantasy, science-fiction, cyberpunk, historical-fiction, romance,
  adventure, dystopian, political-fiction, espionage, magical-realism.
- 5 `poetry` skills: poet, sonnet, haiku, free-verse, prose-poetry.
- 8 `quality` skills: self-critique-protocol, story-doctor, literary-editor,
  literary-critic, proofreader, beta-reader, rewriting-engine,
  publication-review.
- `resources/`: French typography, a catalogue of narrative structures,
  lexicons, project startup and tracking templates.
- `examples/saga-les-cendres-de-kivu/`: a complete demonstration project, from
  the bible to the validation report.
- `documentation/`: architecture, skills guide, writing rules, workflow.
- `tests/`: structure validation and constitution rule validation.
