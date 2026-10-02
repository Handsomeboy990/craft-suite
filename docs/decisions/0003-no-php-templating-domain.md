# ADR 0003: no PHP or templating domain; patterns recorded only

Date: 2026-10-01
Status: proposed
Supersedes: none

Roadmap item 8.5. The owner accepts or rejects this record; until then nothing
it describes is acted on. It runs the `technology-selection` order (question 1
first: is anything new required at all) and the `dependency-selection` gate on
the four PHP references named in `docs/architecture/RESOURCE_LIBRARY.md`.

## Context

`RESOURCE_LIBRARY.md` lists four PHP projects and says they "decide whether a
PHP or templating domain is worth opening", with the recommendation recorded
before any PHP code lands. This is that record.

What the suite builds today, read in this session:

- Skill trees: eight, all stack-agnostic procedures. The engineering skills
  already serve a PHP project without a PHP domain: `project-exploration`
  detects Laravel in `resources/stack-detection-table.md`,
  `technology-selection` has a worked example
  (`examples/choosing-against-the-trend.md`) that chooses a PHP framework for a
  PHP-literate maintaining team, and `input-validation` covers the PHP-upload
  case in its adversarial matrix.
- Shippable code: `libraries/ui`, TypeScript and React on Radix (ADR 0002),
  tested with vitest. The two runnable site examples under
  `engineering/dev-skills/site-template-generation/examples/` (the coach
  portfolio and the electrician showcase) are Next.js 16.3.5 on React 19.1.0,
  their verification scripts are Node (`.mjs`), and the third,
  `dashboard-hotel-operations`, is a specification not yet built. No PHP file
  exists in the repository.
- CI: `.github/workflows/validate.yml` sets up Node only (`actions/setup-node`)
  and runs bash and Python checks. There is no PHP runtime, no Composer, no
  PHPUnit in the toolchain.

So no current skill, library or example needs a PHP library or a server-side
template engine, and no specification in the repository names PHP as its
stack.

Forces:

- A domain is not free. Per ADR 0001 a new tree touches `install.sh` (a flag
  and its groups), `.claude-plugin/marketplace.json`, a new `plugins/<tree>`
  bundle and its line in `plugins/build.sh`, the six validation scripts
  (`validate-counts.sh` holds a variable per tree), the count table in
  `AGENTS.md` and `README.md`, a constitution skill by the suite's own
  convention, and a lead agent per `RESOURCE_LIBRARY.md`. A PHP library under
  `libraries/` adds a second language runtime, Composer and PHPUnit to CI.
- A domain with no project to serve is maintained for nobody: every skill in
  it is an untested claim until a delivery exercises it.
- The references are good projects. The question is not their quality but
  whether this suite builds anything they would serve.

## Evidence per reference

Read first-hand from shallow clones of each default branch, licence first.
Nothing was copied.

### `twigphp/Twig`

- Licence: BSD-3-Clause, confirmed (`LICENSE`, "Copyright (c) 2009-present by
  the Twig Team", and `composer.json`).
- What it is: the PHP template engine: a lexer, a token parser per tag, a node
  tree compiled to PHP classes, extensions, a sandbox with a security policy
  (`src/Sandbox/SecurityPolicy.php`), and auto-escaping on by default
  (`Environment` option `autoescape` defaults to `html`). 286 source files,
  about 26,900 lines.
- Maintenance: very active; last commit 2026-09-30, release 3.30.0 dated
  2026-09-25, 3.31.0 in progress. Requires PHP 8.1 or later and three Symfony
  support packages.
- Fit: none today. The suite renders with React; a second template language
  has no consumer. The transferable value is two principles: escape by
  default, with unescaped output as an explicit, named opt-out; and a sandbox
  as an allow-list policy (tags, filters, functions, methods, properties) for
  templates written by someone less trusted than the code.

### `futureplc/twig-stack-extension`

- Licence: MIT, confirmed (`LICENSE.md`). Its README credits an earlier
  project, `filhocodes/twig-stack-extension`, whose licence was not read here;
  irrelevant while nothing is reused.
- What it is: a Twig extension adding `push`, `pushonce` and `stack` tags, so a
  partial can contribute scripts or styles to a named stack the layout renders
  once, with placeholders replaced after rendering. About 344 lines in 10
  files.
- Maintenance: small and quiet; last functional release 1.0.2 on 2025-04-23,
  later commits are dependency-bot updates (last 2026-01-12). Single named
  developer. Requires `twig/twig` 3.9 or later and PHP 8.3.
- Fit: none as a dependency, since it only exists on top of Twig. The pattern,
  a component declaring the assets it needs and the layout emitting each once,
  is already solved in the stack the suite uses (Next.js metadata and script
  handling, React component colocation).

### `webmozarts/assert`

- Licence: MIT, confirmed (`LICENSE`, "Copyright (c) 2014 Bernhard Schussek").
- What it is: static assertion methods that throw one exception type with
  consistent message placeholders (`%s` is always the tested value, `%2$s`
  onward the assertion-specific values). The `nullOr`, `all` and `allNullOr`
  variants (`src/Mixin.php`, 5,827 of the 8,693 source lines) are generated by
  `bin/generate.php` rather than written by hand, and a Psalm plugin carries
  the type narrowing.
- Maintenance: active; release 2.4.1 on 2026-06-15, two named maintainers in
  `composer.json`. Requires PHP 8.2.
- Fit: none as a dependency; the suite's code is TypeScript, where
  `input-validation` already governs boundary checks. The transferable value:
  one consistent message contract across every assertion, and generating
  mechanical variants from one definition instead of hand-maintaining them.

### `theseer/tokenizer`

- Licence: BSD-3-Clause, confirmed (`LICENSE`, "Copyright (c) 2017 Arne
  Blankerts and contributors", and `composer.json`).
- What it is: converts PHP's own token stream into an XML document, one
  `line` element per source line, so other tools can query source as data.
  About 394 lines.
- Maintenance: maintained at low volume; 2.0.1 on 2025-12-08, last commit
  2026-02-03, single principal maintainer. Requires PHP 8.1 with the
  `tokenizer`, `dom` and `xmlwriter` extensions.
- Fit: none. It reads PHP source only, and the suite's codebase-mapping work is
  not PHP-specific. No pattern here is not already covered by the general idea
  behind `codebase-mapping` (source turned into a queryable structure).

## Options

1. Open a PHP and templating domain: a new tree (or an engineering group) with
   a constitution, skills for PHP back ends and server-side templates, a lead
   agent, an installer flag and a plugin.
   Cost: every dependent named in Forces, plus a PHP toolchain in CI once any
   example or library exists, for a domain with no project, specification or
   library asking for it. Rejected at `technology-selection` question 1:
   nothing requires it, and `dependency-selection` refusal "a framework adopted
   inside a feature commit" applies by analogy to a domain adopted ahead of a
   need.
2. Add a PHP library under `libraries/` (for example Twig components mirroring
   `libraries/ui`).
   Cost: a second language runtime, Composer and PHPUnit in CI, a second
   component implementation to keep at parity with `libraries/ui`, and no
   consumer. Rejected at `dependency-selection` question 1 and criterion 1:
   the project already solves component rendering in React, and a second
   implementation of the same thing is the defect the gate names first.
3. No domain and no code; record the transferable patterns in this record so a
   later change can feed them to existing skills, each through its own normal
   gate (a narrower yes).
   Cost: the patterns sit in a decision record until a skill change carries
   them, and a PHP-only reader finds no PHP-specific skill. Mitigated because
   the existing skills are already stack-agnostic and the stack-detection
   table already recognises Laravel.
4. A bare no: record the refusal and nothing else.
   Cost: the first-hand read of four projects is discarded, and the next
   person asks the same question from zero.

## Decision

Option 3. No PHP or templating domain, no PHP library, no PHP code. Deciding
criterion: fit with what the suite builds. All four references have a clear,
permissive licence (two BSD-3-Clause, two MIT) and three of the four are
actively maintained, so licence and maintenance do not decide it; the suite's
only shippable code is TypeScript and React, its CI has no PHP runtime, and no
specification asks for PHP, so a domain would be built ahead of any need.

The patterns worth keeping, stated in the abstract and owned by no single
project, are candidates for later reference notes in existing skills:

- Escape by default, with raw output as an explicit named opt-out (Twig).
  Candidate home: `input-validation`, which already states escaping at the
  render sink; the note would add "default on, opt-out named" as the rule.
- An allow-list sandbox policy for templates or expressions authored by a less
  trusted party (Twig). Candidate home: `security-audit`, for any feature that
  lets users author templates.
- One message contract across all assertions, and generated rather than
  hand-written mechanical variants (`webmozarts/assert`). Candidate home:
  `input-validation`.
- Components declare the assets they need and the layout emits each once
  (`twig-stack-extension`). Already covered by the Next.js stack; noted for
  `site-template-generation` only if a server-rendered kind is ever added.

`theseer/tokenizer` contributes nothing the suite lacks; it is recorded as read
and closed.

Reopening trigger: a delivered or contracted project whose stack is PHP (an
inherited stack per `technology-selection` section 6), or an owner decision to
target a PHP market. Either reopens the question through a new record that
supersedes this one; the Evidence section above is its starting point.

## Consequences

Positive: no new tree, plugin, installer flag, count or CI runtime; the suite
stays one-language for shippable code. Four reference rows in
`RESOURCE_LIBRARY.md` can move from "to analyse" to read, with licences
confirmed. The question stops recurring.

Negative: a PHP project gets the general engineering skills, not PHP-specific
guidance (framework idioms, Composer, PHPUnit conventions). Accepted because
the general skills are the ones that carry the gates, and the stack-detection
table already routes a Laravel repository correctly.

Operational: carrying a pattern into a skill is a separate, ordinary skill
change with its own review and plugin rebuild; this record authorises nothing
beyond that.

## Reversal cost

Low. Nothing is built, so reversing means writing a superseding record and
then paying the cost of option 1 or 2 at that time, with a real project to
justify it. The cost of the domain does not grow while this record stands; it
is the same whenever it is paid, which is why it is deferred until a need
pays for it.
