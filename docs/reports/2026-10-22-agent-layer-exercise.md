# Agent layer exercise, 2026-10-22

Date: 2026-10-22. Roadmap phase 4, item "Exercise the full agent layer".

The eight agents that had never run were dispatched for real, one after the
other or in parallel where their files did not overlap, against the runnable
`engineering/dev-skills/site-template-generation/examples/dashboard-hotel-operations`
app on localhost. `checkup` ran first and `final-verifier` last. This record
states what each dispatch was given, what it produced, what it found, where it
handed off, and what its definition got wrong. The findings on the app are
listed, not fixed. The definition faults that were small and unambiguous are
fixed in the same change as this record; section 6 lists each one.

## 1. Conclusion

All eight agents completed their task and kept to their boundaries. None of
the verifiers fixed anything. `pr-author` did not push or open a pull request
on GitHub. `web-auditor` stayed on the one authorized port. One dispatch
produced a factual error, `web-auditor` calling a production server a
development server. The orchestrator caught it by checking the process, and
the same agent corrected it on a retry with evidence. That is the escalation
path of `model-routing` section 6 working once, on a real case.

The app itself is in worse shape than its documentation says:

- **Gate result:** its own gate does not pass 26 of 26 reliably. Two lines,
  D18 and D20, fail in about 15 of 24 runs because of timing races in the
  check script, not in the app.
- **Launch verdict:** `compliance-verifier` returned **blocked**.
  - **Dependency:** Next.js 16.3.5 carries a critical advisory.
  - **Login limiter:** the per-address limit trusts a client-set header.
  - **Privacy notice:** it is incomplete.

The definitions were usable but under-specified at the same place in most
roles. They say what to verify, but not what to do when the evidence itself is
unstable, missing, or contradicts another agent's.

## 2. Method

### Environment

- **Machine:** Node 24.18.0, Next.js 16.3.5, playwright-core 1.63.0, headless
  Chromium 153.
- **App:** `npm install`, then `npm run build`, in the app directory.
- **Instances:** each agent got its own seeded instance, with its own data
  directory, its own port from 3101 to 3105, a random session secret and a
  shared review password. No agent shared state with another.
- **Gate:** `npm run gate` deletes and rebuilds `.gate/` on every run, so two
  runs in one tree collide. Exactly one agent per wave ran it in the main
  tree. The others ran it in a local clone of `dev` whose push URL was set to
  an invalid value.
- **Authorization:** `web-auditor` received a written authorization record
  before any active probe. It quoted the owner's handover and limited the
  scope to `localhost:3104`, with no load.
- **Agent definitions:** the installed copies under `~/.claude/agents` were
  byte-identical to `agents/` for all eight.

### Routing

The configuration has no `model_routing` section. The default mapping of
`model-routing/resources/routing-policy.md` was therefore applied, and it is
stated in every row: fast to haiku, balanced to sonnet, strongest to opus.

### Baseline, measured by the orchestrator before any dispatch

| Run | Command | Result |
|---|---|---|
| 1 | `npm run gate` | 24 passed, 2 failed (D18, D20), of 26 |
| 2 | `npm run gate -- D18 D20` | 0 passed, 2 failed, of 2 |

## 3. Dispatches

The tier column follows `engineering/dev-skills/model-routing/resources/agent-tiers.md`.
Tokens, tool uses and wall time are the harness figures for each dispatch.

| # | Role | Task | Tier per `agent-tiers.md` | Inputs | Outputs | Evidence | Findings | Handoffs | What the definition got wrong |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `checkup` | Map the app before a small fix | table, MEDIUM: balanced, sonnet (default mapping), effort medium | repository, built app, instance :3101, the intended intervention | architecture as built, 11 fragilities, boundary map, audit pointers | full gate 25 of 26; D20 alone twice: pass; typecheck clean; `git status` empty; 67.6k tokens, 19 tools, 13 min | D20 reads the loading skeleton (cause found in code); stays rows send 20 fields; `X-Forwarded-For` trusted | `principal-engineer`, `source-of-truth` | no rule for a project test command that writes artefacts; no rule to classify a flaky check |
| 2 | `source-of-truth` | Reconcile the app's claims with code and runs | table, MEDIUM: balanced, sonnet (default mapping), effort medium | app README, examples README, contract, CONTINUITY lines, checkup handoff, orchestrator runs | fact record, 7 drifts, 5 unverifiable claims | 24 runs per line; 12-run probe; seed reproduced exactly for 2026-10-01; 68.1k tokens, 38 tools, 15 min | D18 and D20 both flaky, about 15 of 24; D18 cause found; demo banner has no build guard; "26 of 26" drifted in three files | `documentation-engineer`, owning engineer, `checkup` | "the code is the truth" contradicts its own defect rule when the document is a specification; no rule for a nondeterministic test |
| 3 | `design-verification` | Rendered pages against the README specification | table, MEDIUM: balanced, sonnet (default mapping), effort medium | instance :3103, specification, contract, tokens | 8 drift findings, authenticity cluster, reduced-motion result, 25 screenshots | Chromium at 1440 and 390 px, both themes, 3 roles; reduced motion sampled at 40 ms; 54.7k tokens, 17 tools, 3 min | bar count past the panel; room links 18 px wide; no fabricated content | `ui-ux-engineer`, `frontend-engineer`, specification owner | no way to mark a finding read from a screenshot rather than measured; motion set to check unnamed |
| 4 | `web-auditor` | Passive and authorized active audit | `security-driving-signal`: strongest, opus (default mapping), effort high | URL :3104, authorization record, seeded accounts | scope record, passive and active findings, untested list | live requests and responses for each probe; source lines confirmed; 98.8k tokens, 34 tools, 10 min, then the retry below | per-address login limit defeated by a rotating `X-Forwarded-For`; every authorization, CSRF, validation and CSV probe held | `security-engineer`, `backend-engineer`, `compliance-verifier` | no rule to establish the server mode before scoring performance, which is the step it got wrong |
| 4r | `web-auditor` | Retry of 4: correct the server mode, measure performance | same tier: already strongest, retry at the same tier | the orchestrator's evidence of the error | corrected server mode, performance tables | `/proc` command line, no `webpack-hmr`, immutable static caching; TTFB 17 to 115 ms on 13 modules, LCP 100 to 536 ms, CLS 0; 9.6k more tokens, 6 tools | the error was its own inference from a log banner and a script name | none new | same as 4 |
| 5 | `compliance-verifier` | Launch completeness gate | `independent-verifier-floor`, rated HIGH (security and legal blockers): strongest, opus (default mapping), effort high | instance :3105, its database, the gate, backup and restore | 56 rows, 18 pass, 16 fail, 12 not verified, 10 not applicable; verdict **blocked** | full gate 21 of 26 under load; `npm audit`; second identities against the database; restore into a scratch directory; 156.3k tokens, 56 tools, 19 min | Next.js advisories; login limiter; privacy notice incomplete; denied pages unthemed at load | `security-engineer`, `frontend-engineer`, `ui-ux-engineer`, `devops-engineer`, `qa-engineer`, `documentation-engineer` | the handoff names no owner for dependencies, backups, TLS, flaky tests or stale docs; restore boundary unstated |
| 6 | `pr-author` | Package the gate fix as a local pull request | table, LOW packaging slice: fast, haiku (default mapping), effort low | clone, uncommitted fix, before and after runs, configuration | branch `fix/gate-timing-races-d18-d20`, 2 commits, description, handed-over commands | six scripts' last lines; gate D18 and D20 pass; 43.9k tokens, 17 tools, 8 min | configured identity differs from the history; commit convention differs from the log; template lists five of six scripts | `pr-reviewer`, with push and open commands for the owner | Outputs assume a pushed branch and an opened request; no rule for a configuration that disagrees with history |
| 7 | `pr-reviewer` | Review of 6 | `independent-verifier-floor` over the fix slice, MEDIUM: balanced, sonnet (default mapping), effort medium | local branch, base `dev`, description, the author's claims | verdict **mergeable**, no blocker, 4 suggestions, merge-criteria check | three mutations in scratch copies (button never disabled, captions removed, every table tagged skeleton): each failed the check; branch gate pass; six scripts; clone left clean; 30.6k tokens, 11 tools, 6 min | the D18 banner is still read before the wait (latent); the element handle can detach (fails loudly, never passes falsely); corrected the author on history: both identities and prefixed subjects occur on `dev` | `pr-author` (optional suggestions), whoever holds the merge | no rule for reviewing a change to a test itself; no rule for a local request with no CI run |
| 8 | `final-verifier` | Final gate on this change | `independent-verifier-floor` over dispatches 4 and 5, whose security findings this record carries: strongest, opus (default mapping), effort high | the two commits of this change, the acceptance criteria of the handover, the working records | status per criterion and per reproduced claim; verdict **not done**, one named failure, then done after the correction | `npm audit` reproduced; 8 rotating `X-Forwarded-For` logins all 401; `D18 D20` six runs each: 4 of 6 with a failure on `dev`, 6 of 6 passing on the fix branch; author of `6372ed3` confirmed; every file:line in section 5 read; plugin build in a throwaway worktree gave no diff; 69.5k tokens, 30 tools, 12 min | one wrong line in section 5: the room link finding cited a filter chip, `ListView.tsx:187`, instead of the primary cell link | the report author, `design-verification` as the source of the finding | written for code revisions only: no method named for a revision that is a record; no status for a process claim corroborated by artefacts but not re-runnable |

The change packaged in dispatch 6 was written by the orchestrator, not by an
agent: two waits in `scripts/gate/checks-browser.mjs`, with no assertion
changed. Ten runs of `npm run gate -- D18 D20` passed after it, where 13 of 15
and 12 of 15 had failed before. It stays on a local branch. Shipping it is a
separate decision, listed in section 7.

## 4. Escalations

| # | Dispatch | Trigger | Prior | New | Reason | Failed output kept | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | 4 | output-quality-failure, `factual-error-on-verification` | HIGH / strongest / high | HIGH / strongest / high, same agent resumed | "served by `next dev`" was false: `/proc/41910/cmdline` reads `next-server (v16.3.5)` with `NODE_ENV=production`; the performance dimension had been skipped on that ground | the first report, quoted in section 3 row 4 | corrected with its own evidence; performance measured; no security finding changed |
| 2 | 8 | `failed-test-or-gate`, on this record | not applicable: the orchestrator's own output | not applicable | the final gate found one file:line in section 5 pointing at the wrong element | the first commit of this record | line corrected, then re-checked by the same `final-verifier` |

## 5. Findings on the app

Listed, not fixed. Paths are relative to the app directory.

| Severity | Finding | Where | Found by | Owner |
|---|---|---|---|---|
| High | `next` 16.3.5 is inside the range of 7 advisories, 1 critical (GHSA-vcvr-r3jv-pc5j, `next/og`) and 1 high (GHSA-cjq9-62q9-8jv4, image optimization); the fix is 16.4.2. The app imports neither `next/og` nor `next/image`, which narrows the exposure; it is a dependency decision for the owner. Reproduced by the orchestrator. | `package.json:20` | 5 | `security-engineer`, owner approval |
| Medium | The per-address login limit is keyed on the first `X-Forwarded-For` value, which any client sets. Twenty attempts with rotating values and identifiers were all answered 401, never 429, so password spraying is unthrottled without a trusted proxy. The per-account limit holds, and the audit `address` column is forgeable the same way. | `lib/rate-limit.ts:56-60`, `app/api/admin/login/route.ts:11,24` | 1, 4, 5 | `backend-engineer` |
| Medium | Privacy notice: reachable and linked from sign-in only. It is linked from no signed-in page, and its clauses omit the IP address held in the audit and session tables, the controller's identity, and the retention of stays, folios and ledger. The wording is the owner's. | `app/layout.tsx:18`, `app/privacy/` | 5 | owner, `frontend-engineer` for the link |
| Medium | Gate lines D18 and D20 fail in about 15 of 24 runs: D18 reads a row button before the list hydrates, D20 can read the loading skeleton. The app behaves correctly. A fix exists on the local branch of dispatch 6. | `scripts/gate/checks-browser.mjs:384-392,478-515` | 1, 2 | `qa-engineer` |
| Medium | Denied pages (403) render without the theme variables at the load event in 10 of 24 loads, against 0 of 12 on a 200 page. They resolve within 1.5 s. It is the cause of gate line D2 failing. The cause in code is not established. | `app/forbidden.tsx`, `app/layout.tsx:73` | 5 | `frontend-engineer` |
| Low | Gate lines D13 and D23 also failed once in a full run under load and passed alone. | `scripts/gate/` | 5 | `qa-engineer` |
| Low | `GET /api/stays` sends 20 fields per row for 7 shown columns. The contract says columns the table does not show are not sent, and gate D14 prints the count without asserting it. | `lib/modules.ts:204-216`, contract `resources/dashboard-contract.md:445-446` | 1, 2 | `backend-engineer`, or the contract owner |
| Low | The demonstration banner depends only on a database flag. A production build shows it. The contract says it "can never be on in a production build"; the only guard is the seed refusing `HOTEL_ENV=production`. | `lib/db.ts:61-63`, `app/layout.tsx:37,82`, contract `:394` | 2 | owner decides the rule |
| Low | On the overview, the count of the longest bar sits outside the panel. The count is positioned at `100%` plus one unit, so a full-width bar pushes it past the track. This was seen in a screenshot and confirmed in the CSS. | `app/globals.css:990-995` | 3 | `frontend-engineer` |
| Low | The room number links on `/rooms` are 18 px wide, under the 24 px of WCAG 2.2 target size, and the rooms list is not among the screens gate D23 measures. | `components/ListView.tsx:275-282` | 3 | `frontend-engineer` |
| Low | Passwords use scrypt with N = 2^14, below the 2^17 the OWASP Password Storage Cheat Sheet gives as its minimum. | `lib/password.mjs:6` | 5 | `security-engineer` |
| Low | Launch completeness items, tradeable or to accept in writing for a staff-only noindex app: no terms of use; one title on every route; no meta description, social preview, `robots.txt` or canonical; ten competing primary buttons on the overview; no backup schedule (the restore itself is proven). | `app/`, the README | 5 | owner, `frontend-engineer`, `devops-engineer` |
| Info | `X-Powered-By: Next.js` is sent; page renders run retention writes; the CSV guard also prefixes phone numbers that start with `+`. | `next.config.mjs`, `lib/authz.ts:123`, `lib/api.ts:164-170` | 1, 4, 5 | `backend-engineer` |

### Documentation drift

These claims are recorded here, not corrected in this change:

| Claim | Where |
|---|---|
| "26 of 26 lines passed" | the app `README.md:75` |
| "all twenty six passed", "26 of 26 passed on the last run" | `examples/README.md:27,38` |
| "26 of 26 on the recorded run" | `CONTINUITY.md:94` |

The 2026-10-01 run cannot be reproduced. The seed is deterministic for that
date, and today's volumes differ only because the gate anchors on today.

### Held under test

These held, and are recorded so that the next audit does not start from zero.
This is not a statement that the app is secure:

- function and object level authorization across all five roles;
- CSRF on every write;
- server-side validation;
- CSV formula neutralization;
- generic errors;
- server-side session invalidation;
- the security headers;
- no secret in the client bundle.

## 6. Definition fixes in this change

Each fix answers a fault observed in a dispatch above. None touches a
boundary that limits what an agent may do.

| Definition | Change | From dispatch |
|---|---|---|
| `agents/core/checkup.md` | Running the project's own test command is inspection if it writes only ignored output, named in the report. A failing check is re-run and repeated before it is reported, and a flaky one is reported as flaky with its rate. | 1 |
| `agents/core/source-of-truth.md` | A specification or contract is the exception to "the code is the truth": code that violates it is a defect, not a drift settled in the code's favour. A test that passes and fails on the same code is repeated and its rate recorded. | 2 |
| `agents/design/design-verification.md` | Each finding says whether it was measured or read from a screenshot. Reduced motion is checked on every kind of motion the page has. | 3 |
| `agents/security/web-auditor.md` | The server mode is established from evidence before performance is scored or skipped. | 4, 4r |
| `agents/core/compliance-verifier.md` | Never restores over the instance under verification. Handoff owners added for dependencies, backups and TLS, flaky acceptance checks and stale handover claims. | 5 |
| `agents/core/pr-author.md` | When the push or the pull request is kept, the outputs end at the commits and the description, and the handoff carries the commands. A configured identity that differs from the history is named for the owner, never resolved by rewriting history. | 6 |
| `agents/core/pr-reviewer.md` | A change to a test or a check is shown to fail on a deliberately wrong behaviour, in a scratch copy outside the tracked tree. Where no CI run exists, the review says what it ran in its place. | 7 |
| `agents/core/final-verifier.md` | When the revision is a record, a report or an audit rather than code, the evidence it cites is re-run and every reference it gives is checked. | 8 |

The other feedback was not acted on here because it is broader than a small
fix:

- **`compliance-verifier`:** applicability rules for an authenticated noindex
  product, and a rule for code-level evidence. This feedback belongs to
  `launch-readiness`, not to the agent.
- **`web-auditor`:** its "delegates to" wording.
- **`pr-author`:** how to cite another agent's evidence.
- **`final-verifier`:** a third status, corroborated by artefacts but not
  re-runnable, would change the semantics of a gate. It is left to the owner.

## 7. Follow up

- **Gate fix, owner's decision:** ship the D18 and D20 fix as its own pull
  request. It is on the local branch `fix/gate-timing-races-d18-d20`, not in
  this change.
- **Next.js upgrade:** from 16.3.5 to 16.4.2. This is a dependency change, kept
  by the configuration, with the twelve-point evaluation of
  `dependency-selection`.
- **Commit identity:** the configuration's `identity.author_name` is
  `Handsomeboy990`.
  - On `dev`, 201 commits are authored `Lauret Chacha` and 175
    `Handsomeboy990`, with the same email, and the last 40 are all
    `Lauret Chacha`.
  - `pr-author` followed the configuration, as `git-workflow` says, and
    flagged the difference.
  - The owner sets which name is right with `bash install.sh --configure`.
- **Commit convention:** the configuration's `git.commit_convention` is
  `conventional`. 89 of the last 300 subjects on `dev` carry a type prefix;
  the rest are plain imperative summaries. The same decision applies.
- **Commit `6372ed3` (2026-10-01):** it is authored
  `Claude <noreply@anthropic.com>`, against permanent rule 4.
  - `pr-reviewer` found it while checking the history.
  - Correcting it means rewriting the history of a shared branch, a
    destructive operation. It is reported here, not performed.
- **Pull request template:** `.github/pull_request_template.md` says "All six
  must pass" and lists five scripts. `validate-counts.sh` is missing.
- **App documentation:** correct the drifted "26 of 26" claims once the gate
  fix lands, so the corrected claim can be true.
