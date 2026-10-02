# ADR 0004: libraries/ui is released under MIT

Date: 2026-10-02
Status: accepted (by the owner, 2026-10-02)
Supersedes: none

The owner's decision, recorded as `libraries/ui/README.md` required when the
library's licence changed.

## Context

The repository is proprietary: all rights reserved, visible for reference only.
`libraries/ui` was created under the same terms, with its own `LICENSE`, as
`libraries/README.md` requires of every library. Its README left open whether
it would later be released under an open licence so other projects could
install it, as the maintainer's decision.

The library is built to be reused: a project copies or installs its tokens and
primitives and owns them, per `docs/decisions/0001-resource-library-structure.md`
and the shadcn ownership model. Under all-rights-reserved terms nobody may do
that without written permission, which defeats the purpose of a shippable
library.

Its third-party dependencies are the Radix primitives, which are MIT, so they
impose nothing that conflicts with an open licence.

## Options

1. Keep it proprietary. Reuse stays by written permission only. Nothing to
   change, and the library cannot serve its purpose outside the owner's own
   projects.
2. MIT. Short, permissive, the same licence as its Radix base and the common
   choice for UI component sets. Anyone may use, copy, modify and redistribute
   it, keeping the copyright and permission notice.
3. Apache 2.0. Permissive with an explicit patent grant. Longer, adds a NOTICE
   obligation, and the patent grant has little weight for a UI component set.

## Decision

Option 2: `libraries/ui` is released under MIT, chosen by the owner. The
library's `LICENSE` is the MIT text with the owner as copyright holder, and its
`package.json` declares `"license": "MIT"`.

Only `libraries/ui` changes licence. The rest of the repository, including the
skills, the agents and every other library, stays under its own terms. A future
library chooses its licence in its own record.

## Consequences

- Other projects may install and reuse `libraries/ui` without asking, keeping
  the notice.
- The open licence applies to versions published from this decision on; it does
  not reach back into the rest of the repository.
- `package.json` keeps `"private": true`, so nothing is published to a registry
  by accident; publishing is a separate release decision.
- Every file added to `libraries/ui` from now on is offered under MIT, so code
  under an incompatible licence must never be pasted in. The originality rule
  already forbids copying.

## Reversal cost

Low going forward, impossible backwards. A later version can return to a
closed licence, but copies already taken under MIT keep their MIT grant.
