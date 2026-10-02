# Resource-library direction

Why this document exists: the suite is turning from a library of knowledge
into a library of resources. Knowledge is a skill, a procedure an agent reads.
A resource is also code a project installs and runs: a UI component, a
deployment recipe, a validation helper. The two are built and verified
differently, and a resource needs a home the current layout does not give it.

This document states the target shape and the rules that keep it coherent. It
is design reasoning, not usage, so it lives in `docs/`. The roadmap that
sequences the work is `docs/ROADMAP.md`, phase 8 onward.

## What changes, and what does not

The eight skill trees stay where they are. They are already organised by
domain, and `install.sh`, `marketplace.json`, the six validation scripts and
`plugins/build.sh` all depend on their paths. Moving them buys a tidier
diagram at the cost of breaking every one of those, for no reader's benefit.

What is new is a place for code. Today the only shippable code in the
repository, the two site examples under `site-template-generation`, is
duplicated: twenty-nine files are byte-for-byte identical between the coach
portfolio and the electrician showcase, and copied again into `plugins/`. That
duplication is the first proof that a shared library is missing.

## The target shape

```
libraries/                 shippable, installable code, one directory per library
  ui/                       design tokens, accessible primitives, a motion layer
    tokens/                 colour, type scale, spacing, radius, motion, as CSS vars
    components/             one directory per component: code, test, doc, example
    README.md               what it is, how a site installs it, the licence
  <future libraries>        a deployment recipe set, validation helpers, and so on

<domain-tree>/              unchanged: writing, documents, engineering, security,
                            research, career, opportunity, shared
  <group>/<skill>/          SKILL.md, README.md, examples, resources

agents/<group>/             unchanged: the role definitions, repository wide
```

A library is not a skill and does not pretend to be one. A skill under
`engineering/dev-skills/` teaches how the library is built and kept honest;
the library under `libraries/` is the artefact that teaching produces. The
skill is referenced by the agents; the library is installed by a project.

Each library carries its own licence file, because it ships independently of
the suite and a project that installs it needs to know its terms without
reading the whole repository.

## The per-domain team, under one orchestrator

Every resource domain is built and maintained by a team of agents, and every
team reports to the single orchestrator that already sits at the top of the
agent layer: `delivery-orchestrator`. The chief is not duplicated per domain.
What each domain adds is a lead agent that owns that domain's resources and
dispatches the specialists under it, exactly as `design-director` already
leads `design-research`, `ui-ux-engineer` and `design-verification`.

```
delivery-orchestrator            the chief, over everything, holds the gates
  principal-engineer             one multi-surface request
    <domain lead>                owns one domain's resources
      <specialist agents>        do the work within the domain's boundary
```

The lead never signs off its own work. The boundary that makes two agents
cooperate rather than collide is the `Boundaries` section of each definition,
and the review gates in `agents/README.md`. Strengthening the chief means
strengthening the skills it loads (`delivery-orchestrator`,
`engineering-orchestrator`, `model-routing`, `task-complexity`), not adding a
second chief.

## The rule every reference obeys

The suite studies real projects and builds its own, better, version. It does
not copy them. This is `design-research`'s four-level rule applied to code as
well as design:

```
reference        the real project, its code and assets, owned by its authors
inspiration      the direction it gives, free to take
pattern          the reusable technique, stated in the abstract
implementation   the original result this suite ships, the only thing committed
```

Two hard consequences:

- A permissive licence (MIT, Apache 2.0) is not permission to paste. Even
  where the licence would allow it, the result is written here from the
  pattern, so the suite owns and can stand behind every line. Where a small
  amount of MIT code is genuinely reused, its licence and origin are recorded
  against it, per `dependency-selection`.
- A restrictive licence is a wall. React Bits carries a Commons Clause that
  forbids selling its code or a product whose value derives from it; its
  components are studied for their patterns and never reused. Any reference is
  checked for its licence before a line is written.

"Better, with no flaw" is the aim, stated honestly as an aim: the repository's
own rules forbid ever declaring a system secure or flawless. What is
guaranteed is the gates, not the absence of bugs: every resource passes
`code-review-protocol`, its tests, `security-audit` where it has a boundary,
`accessibility-testing` where it has a surface, and `validation-gate` before
it ships.

## The reference projects

Each project is studied for what it does well and what it lacks against what
this suite is building. The analysis is the first task of the phase that uses
it, so that nothing here asserts an internal detail before it was read. The
table records only what has been confirmed by a first-hand read in the session
that added the row; everything else is marked to analyse.

| Project | Licence | What it is | Confirmed |
|---|---|---|---|
| `shadcn/ui` | MIT | copy-into-codebase components on Radix and Tailwind; the ownership model | read |
| `magicuidesign/magicui` | MIT | animated marketing components, shadcn registry, Framer Motion | read |
| `DavidHDev/react-bits` | MIT + Commons Clause | ~180 animated effects, four JS/TS and CSS/Tailwind variants; patterns only, never reused | read |
| `trailhq/Graft` | MIT | a structural context map of a codebase for coding agents; the idea behind `codebase-mapping` | read |
| `Cecuro/open-security` (OpenSec) | Apache 2.0 | local AI security-review agents, independent probes, validation by attack-path tracing, a SQLite ledger | read |
| `handsomeboy990/curb` | third-party components under their own licences | an accessibility remediation agent measured on real assistive-tech outcomes, six capability levels, a verify loop, an integrity boundary that hides the answer key | read |
| `sharkui-inc/shark-ui` | MIT | accessible components on Ark UI and Tailwind, copy-into-codebase registry | read |
| `vprix21/neonblade-ui` | MIT | React, Tailwind v4 and Framer Motion components, cyberpunk aesthetic, `npx neonblade add` | read |
| `Balastrong/start-theme-demo` | not stated, confirm before reuse | a TanStack Start theming demo, tokens switched on one attribute | read |
| `Balastrong/confhub` | no licence file; `package.json` says ISC as metadata only; patterns only | a conference directory on TanStack Start, Drizzle and Better Auth; strong server-function boundary and atomic rate limiting, weak on drafts, migrations and tests; notes in `docs/architecture/APP_REFERENCES.md` | read |
| `majodev/google-webfonts-helper` | to confirm | self-hosting helper for Google Fonts | to analyse |
| `adrianhajdin/yc_directory` | none found, all rights reserved; patterns only | a Next.js and Sanity pitch directory tutorial; server-only write client and generated types worth taking, client-only validation and disabled build gates not; notes in `docs/architecture/APP_REFERENCES.md` | read |
| `futureplc/twig-stack-extension` | MIT | Twig `push`, `pushonce` and `stack` tags: components contribute assets a layout emits once; patterns only, already covered by the Next.js stack (ADR 0003) | read |
| `twigphp/Twig` | BSD-3-Clause | the PHP template engine: escape by default, allow-list sandbox policy; patterns only, no PHP domain (ADR 0003) | read |
| `webmozarts/assert` | MIT | PHP assertions with one message contract and generated variants; patterns only, candidate note for `input-validation` (ADR 0003) | read |
| `theseer/tokenizer` | BSD-3-Clause | turns PHP's token stream into XML; nothing the suite lacks, closed (ADR 0003) | read |
| `dokku/dokku` | MIT, to confirm | a small self-hosted platform-as-a-service, git-push deploy | to analyse |
| `sst/opencode` | MIT | an open-source terminal coding agent, client/server, subagents; permission rulesets, inherited denies, plan and build modes, loop detection and compaction feed the chief; notes in `docs/architecture/AGENT_REFERENCES.md` | read |

`L1B3RT4S` was named among the references and is deliberately excluded: it is a
collection of prompts for defeating model safety measures, which this suite
does not reproduce or improve. The defensive concern it gestures at, hardening
a model-backed feature against prompt injection, is owned by the
`llm-integration` skill.

## What each reference feeds

Stated as direction, confirmed per phase in `docs/ROADMAP.md`.

- UI libraries (`shark-ui`, `neonblade-ui`, `start-theme-demo`, React Bits for
  patterns, shadcn and Magic UI for the model) feed `libraries/ui/` and the
  `design-system`, `animation`, `ui-ux-engineering` skills. The first-hand
  read is recorded in `docs/architecture/UI_REFERENCES.md`.
- `google-webfonts-helper` feeds a font self-hosting resource and the
  `seo-engineering` and performance concerns.
- `confhub` and `yc_directory` are full applications: they feed the delivery
  and full-stack skills as worked references, not libraries.
- The PHP and Twig projects were judged in ADR 0003
  (`docs/decisions/0003-no-php-templating-domain.md`): no PHP or templating
  domain and no PHP code; their patterns are recorded for existing skills.
- Graft and `opencode` feed the agent and orchestration layer:
  `codebase-mapping`, `engineering-orchestrator`, `model-routing`, and the
  chief's own skills.
- OpenSec and `curb` feed the security and accessibility layers: the probe,
  validate, ledger pattern for `security-audit` and the authorized-testing
  agents; the measured-outcome and verify-loop discipline for
  `accessibility-testing` and a possible accessibility-remediation capability.
