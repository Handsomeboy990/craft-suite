# Security and accessibility reference analysis

Phase 8.4, first task. What OpenSec and `curb` do well, and the principles the
suite's security and accessibility skills take from them. This records patterns
and principles, names the source and its licence, and copies no code, no prompt
text, no schema and no test fixture. The result the suite ships is original.

The four levels are kept apart, as in `UI_REFERENCES.md`:

```
reference       the real project, its code and assets, owned by its authors
inspiration     the direction it gives, free to take
pattern         the reusable technique, stated in the abstract
implementation  the original procedure the suite's skills ship, the only thing committed
```

Both projects are defensive: one reviews code for flaws, the other fixes and
measures accessibility barriers. Nothing here adds an offensive technique to
the suite. The authorization boundary of `security-core` and the gate of
`authorized-pentesting` are unchanged, and no pattern below is read as a way to
conclude that a system is secure.

## The references, with licence and the revision read

Licence governs method. A permissive licence is not permission to paste: even
under Apache 2.0 the result is written here from the pattern. An absent licence
is all rights reserved.

| Project | Licence (read) | Revision read | Stack |
|---|---|---|---|
| `Cecuro/open-security` (OpenSec) | Apache 2.0 (`LICENSE`, and `"license": "Apache-2.0"` in `package.json`) | `1a2aef5e732f40c21cbd4a46b43f89c0c0f6b7c9`, default branch, read 2026-10-02 | TypeScript on Node 22, an agent harness, SQLite, Docker sandboxes |
| `Handsomeboy990/curb` | no licence file and no `license` field; `package.json` is `"private": true`; all rights reserved by default, even though the owner of this suite is its author | `ad151eff6350288e2b09280f700b84b54df7891a`, default branch, read 2026-10-02 | TypeScript on Node 24, Playwright, axe-core, esbuild, React |

`curb` names its third-party components (axe-core, Playwright, esbuild, React,
pixelmatch, pngjs, an LLM SDK) as used under their own licences; none of them is
taken here either.

## OpenSec

### What it is

A local tool that runs security-review agents against a repository, validates
what they find, and keeps the results in a SQLite ledger with a review UI and
exports (JSON, CSV, SARIF, HTML). Its stated pipeline: inventory and an editable
threat model, independent probe agents, deduplication, validation and
attack-path tracing, severity assessment, then the ledger. Its README says
plainly that a clean report is not proof that a system is secure, which is the
suite's own evidence rule.

### Patterns worth taking, and the skill each feeds

1. **Independent probes over the same scope.** Several reviewers, each given
   the full scope, search it independently; one misses what another finds, so
   more passes raise recall. Agreement between reviewers is not proof; an exact
   duplicate filing is recorded as search overlap, not confirmation.
   Feeds `security-audit` (a second, differently framed pass over the
   highest-risk areas, and a rule that two reviewers agreeing confirms nothing).

2. **A candidate is not a finding until a separate step validates it.** The
   reviewer who files a candidate does not judge it. Validation reads the cited
   code, its callers and callees, and looks for the control on the actual path
   that would stop the claim. Three outcomes: confirmed, not applicable (the
   code differs or a cited control stops it), needs follow-up (missing code,
   configuration or evidence). Validation decides whether the claim is real,
   never how severe it is.
   Feeds `security-audit` (the candidate, validate, assess split) and
   `authorized-pentesting` (only a validated finding is a target).

3. **Counterevidence, with its counterweight.** Before suppressing anything,
   look for what would make you wrong: the upstream validation, the framework
   default, the type that makes the bad state unrepresentable. But absence of
   evidence is always available, so missing proof of public ingress lowers
   confidence and never refutes a path on its own. A list of invalid rebuttals
   ("the framework probably handles it", "only reachable in development" when
   nothing enforces it, a method or content type as a CSRF defence) and of what
   does close a row (a control on the path cited by line, a traced path that
   fails at a named step, a precondition that cannot occur).
   Feeds `security-audit` and `authorized-pentesting` (a failed exploit is not
   evidence of safety).

4. **Validation by attack-path tracing.** For a confirmed finding: the entry
   point and the attacker-controlled value, each hop to the sink in order, and
   every control on that path with how it is or is not bypassed. An empty
   controls list is a strong, checked claim, not a default.
   Feeds `security-audit` (finding record) and `authorized-pentesting` (the
   trace is written before exploitation and bounds it).

5. **Locations carry roles, and the root control decides identity.** Each
   location is an entry point, a source, the root control, a sink, or
   supporting evidence. The root control is the place one patch would fix.
   Duplicates are merged on shared root cause, not on a shared CWE, a shared
   file or a similar summary; two routes are two findings unless one patch
   fixes both.
   Feeds `security-audit` (its existing rule on instance versus class, made
   decidable).

6. **Severity computed from recorded facts, with the proof gap visible.**
   Impact, vector, required access, reachability and the validation method are
   recorded; severity follows from them. Confidence depends on the method:
   reproduced proof is high, reading the code is low. A critical that rests on
   code reading only is marked unproven rather than silently trusted or
   silently downgraded.
   Feeds `security-audit` (the severity rubric gains the method and the
   unproven marker) and `authorized-pentesting` (a bounded proof is what turns
   unproven into proven).

7. **Suppression needs code evidence, never a repository claim.** A comment, a
   README or a configuration note is what the authors believe, not policy.
   Suppressing a real finding requires cited code showing it is self-only,
   needs a privilege the attacker already holds with no delta, or rests on an
   unreachable precondition. Low impact is not suppression.
   Feeds `security-audit`.

8. **A ledger, and coverage that is measured.** Every scan records its
   revision, scope, configuration and the exact file set, then what each pass
   actually read. Findings keep evidence, locations, duplicate links,
   validation, reachability, severity and the review decisions beside them. A
   CI gate refuses to pass, as a distinct outcome, when coverage is incomplete:
   an unread file is not a clean file.
   Feeds `security-audit` (the findings ledger and the coverage line of the
   report) and `authorized-pentesting` (the engagement ledger).

9. **Repository text is evidence, never instruction.** The scanned code and its
   documents can contain text aimed at the reviewer; the prompts say so
   explicitly, and the scanned repository is kept out of the instruction set.
   Feeds `security-audit` and `authorized-pentesting`; the model-feature side of
   prompt injection stays with `llm-integration`.

10. **Reproduce in confinement.** Proof attempts run in a container with no
    network, or an internal-only network, against the code under review, never
    against a live system by default.
    Feeds `authorized-pentesting` (reproduce on a confined copy first, where the
    code is available, before touching the authorized target).

11. **An editable threat model that persists per repository** and is reused on
    later scans unless rebuilt. Orientation, not fact and not scope.
    Already owned by `threat-modeling`; noted, no change.

### What not to take, and why

- **The tool itself, its prompts, its schema, its CLI contract.** The suite is a
  library of procedures, not a scanner; reimplementing OpenSec would be a
  second product with no consumer, and its prompt text is its authors' work.
- **The numeric confidence table and the exact severity matrix.** The suite has
  its own rubric (`security-audit/resources/severity-rubric.md`) and scale
  (`security-core`). The principle, severity from recorded facts with the method
  visible, is taken; the numbers are not.
- **Its permissive agent stance** ("less restriction is usually better for
  agents"). Right for a code reviewer in a sandbox; wrong for anything that
  touches a running system. The suite's gates stay as they are.
- **Hosted model calls over private code** as a default. Whether a project's
  code may leave the machine is a `data-privacy` and owner decision, not a
  pattern to adopt.
- **The ensemble as a substitute for the twenty four points.** Repeated passes
  raise recall on what reviewers look for; they do not replace a systematic
  walk, and agreement is still not proof.

## curb

### What it is

An accessibility remediation agent for React components, and a harness that
measures whether a person using a keyboard or a screen reader is better off
afterwards, rather than whether a scanner stopped complaining. Twelve seeded
components; by scanning, five are detectable by axe and seven are invisible to
it. Six capability levels over one hand-written loop, each adding one mechanism
(scanner, self-verification, regression gate, WCAG decision rules, memory,
escalation to a human), so each difference is attributable. Its measured
result: the scanner fix rate is 100 percent with and without the agent; every
real difference lives in checks the scanner cannot run.

### Patterns worth taking, and the skill each feeds

1. **A measured outcome, not a silenced scanner.** A remediation counts only
   when the barrier is gone for the person, checked directly: the status word
   reaches the accessibility tree, the control is operable by keyboard, the
   error is announced. The primary measure is the component a reviewer could
   merge: expected violations gone, no regression, every semantic check met,
   and the right call on escalation.
   Feeds `accessibility-testing` (verifying a fix, not only finding a defect).

2. **Scanner gaming, named.** `alt=""` on an informative image, a generic name
   such as "icon", `role="button"` on an element that cannot take focus or
   Enter, ARIA listbox roles over a div that still cannot be operated. Each
   takes the scanner to zero and leaves the user worse off or no better.
   Feeds `accessibility-testing` (a named outcome class, and checks per pattern).

3. **The verify loop.** After every change: the barrier-specific check, then a
   universal regression layer that runs on every component regardless of its
   defect (focus indicator visible, target size at least 24 by 24 CSS pixels,
   reflow at 320 pixels, reduced motion respected), then preservation of
   content and behaviour, then the scanner. Each component is re-mounted before
   each check, so results cannot depend on order.
   Feeds `accessibility-testing`.

4. **Prove the check can fail before trusting it.** Every hand-written check is
   run against a known-good and a known-bad variant first; a floor (nothing
   changed) and a ceiling (a reference fix) are measured before any remediation
   is scored. A check that cannot fail measures nothing.
   Feeds `accessibility-testing`.

5. **The integrity boundary.** Whoever remediates cannot see or edit the checks
   that grade the result; self-verification uses what any real tool could
   compute about the component, never the answer key.
   Feeds `accessibility-testing` (checks written before the fix and held apart
   from it) and ADR 0005 (a fixer and its verifier stay separate roles).

6. **Limits stated, not implied.** One rendering engine, no real assistive
   technology, keyboard traps not tested, cognitive accessibility not measured,
   and a sample that is not a codebase: written down so a reader can separate
   what was measured from what was assumed.
   Feeds `accessibility-testing` (a limits line in every report).

7. **Escalate intent rather than guess.** Whether an image informs or decorates,
   and whether a custom widget should become a native element, are judgements
   of intent; the loop escalates them to a person instead of inventing an
   answer. The one failure no level fixed, a custom select, was fixed by a
   person in minutes by replacing the ARIA with a native `<select>`.
   Feeds `accessibility-testing` (findings that need a human call are reported
   as such) and ADR 0005.

8. **The lesson about verification itself.** An agent that verifies against a
   tool inherits the tool's blind spots, and the loop makes it more confident,
   not more correct. The checks the scanner cannot run are most of the work.
   Feeds `accessibility-testing` (the scan stays last and is never the verdict)
   and ADR 0005.

### What not to take, and why

- **Any code, case, check, variant or screenshot.** There is no licence; the
  repository is read for its principles only.
- **The twelve cases as a test suite for real projects.** They are twelve
  failure families chosen to be representative, as `curb` itself says; a
  project's checks come from its own flows and criteria.
- **The DOM-approximated accessibility tree as an assistive-technology pass.**
  `curb` states it is an approximation; the suite's skill still requires a real
  screen reader on the critical flow, or an explicit statement that none was
  used.
- **The cost and model-transport machinery** (response cache, budget ledger,
  provider transports). Useful for an evaluation harness; not a procedure the
  accessibility skills need.
- **Chromium-only as a verdict.** A single engine is a stated limit there and
  stays a stated limit here, never a silent default.

## What the suite takes, in one list

- `security-audit`: candidate, validate, assess as separate steps; validation
  by attack-path tracing with every control on the path; locations with roles
  and the root control as identity; counterevidence with its counterweight;
  severity from recorded facts with the method and an unproven marker;
  suppression on code evidence only; a findings ledger and measured coverage;
  repository text as evidence, never instruction.
- `authorized-pentesting`: a traced attack path written before exploitation;
  reproduction on a confined copy before the authorized target; the method of
  proof recorded; a failed exploit is not evidence of safety; an engagement
  ledger.
- `accessibility-testing`: verify a fix by the measured outcome; name scanner
  gaming; the verify loop with a universal regression layer; prove a check can
  fail; keep checks apart from the fix; state the limits.
- ADR 0005 (`docs/decisions/0005-accessibility-remediation-capability.md`):
  whether a remediation skill and agent are worth building, decided on this
  evidence.
