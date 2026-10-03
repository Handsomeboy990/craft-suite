---
name: architecture-design
description: Designs the smallest architecture that serves the product: reads the existing structure, sets boundaries and data ownership, chooses integration and failure strategies, and refuses premature abstraction, microservices and useless layers. Use before building a subsystem or changing a boundary.
license: MIT
metadata:
  category: dev-skills
  version: 1.1.0
  depends_on: [engineering-core, project-exploration]
  outputs: [architecture-decision, boundary-map, failure-model, decision-record]
---

# Architecture Design

Decides where code lives and who owns what. The output is a decision with a
stated cost, not a diagram.

Architecture is the set of decisions that are expensive to reverse. Everything
cheap to reverse is implementation and does not belong here.

## 1. Entry condition

Runs when the change creates or moves a boundary: a new subsystem, a new data
owner, a new integration, a new deployment unit, a change in who may call
whom.

Does not run for a change confined to one existing module. Reaching for this
skill on a two file change is itself an architecture defect.

## 2. Protocol

### Step 1, describe the architecture that exists

From the project map, not from a template. Name the layers actually present,
the direction of dependencies between them, and the one or two places where
that direction is already violated.

Do not name a layer the project does not have. A project with handlers calling
the ORM directly has two layers, not five, and pretending otherwise produces a
design nobody can follow.

### Step 2, state the forces

Write four lines, no more:

```
Constraint   what cannot change: runtime, data store, deployment, team size
Load         requests, data volume, growth rate, or Unknown with the reason
Failure cost what breaking looks like: money, data loss, downtime, annoyance
Change rate  how often this area is expected to change
```

Failure cost drives rigour. A billing path and a marketing page do not deserve
the same design budget, and pretending they do wastes the budget on the wrong
one.

### Step 3, place the responsibility

Every piece of behaviour has exactly one owner. Decide the owner before
writing a line.

| Behaviour | Correct owner |
|---|---|
| shape and syntax of external input | the boundary handler |
| business rule and invariant | the service or domain module |
| persistence and query construction | the data access module |
| authorization decision | the service, applied at the boundary |
| presentation and formatting | the view layer |
| cross cutting concerns | middleware, declared once |

The test for a misplaced responsibility: if the same rule must be repeated
when a second caller appears, it is in the wrong place.

### Step 4, define the boundary contract

For each boundary the change touches:

```
Input      shape, required fields, ownership of identifiers
Output     shape, error shape, status codes
Invariants what the caller may assume
Failures   what the caller must handle
Ownership  which module may write this data
```

Data ownership rule: one module writes a table, others read through it. When
two modules write the same table, they are one module that has not been
merged.

Dependency direction rule: once the product has more than one package or
module, the direction between them is written down once, as an ordered list where each entry names what it may
import, and a check in the pipeline enforces it.

```
schema     shapes and validators, imports nothing in the product
domain     business rules, imports schema
transport  handlers and server, imports domain and schema
clients    import schema and generated clients, never domain or transport
```

The names follow the project; the arrows point one way. The check is an
import rule, a dependency graph check in the pipeline, or the language's own
visibility (internal packages, module exports), and it fails the build when an
arrow points back. A direction that lives only in a document drifts at the
first convenient import. The violations found in step 1 are listed as the
check's only exceptions, each recorded as damage per section 4, so the check
blocks new ones from the day it is added. For a server with several clients,
`api-design` section 10 states the same rule for the published contract.

### Step 5, model the failures

For every external dependency, decide before implementation:

- timeout value and where it is set;
- retry policy, bounded, with the idempotency requirement it implies;
- behaviour on permanent failure: fail closed, fail open, degrade, queue;
- what the user sees;
- what the operator sees.

A design that only describes the success path is not a design.

### Step 6, choose the smallest shape

Start at the smallest option and move up only when a stated force forces it.

```
one module
  -> two modules with an explicit interface
    -> a separate process in the same repository
      -> a separate deployable service
```

Each step up costs a network boundary, a failure mode, a deployment, an
observability surface and a migration. Name the force that pays for it, or do
not take the step.

### Step 7, record the decision

Short decision record, from the template in
`resources/decision-record-template.md`. Context, options, decision,
consequences, reversal cost. Filed where the project keeps documentation, or
proposed if the project has no such place.

## 3. Refusals

Refused unless a stated force demands it, and the force is written down:

- microservices for a team that deploys one artefact;
- a repository layer wrapping an ORM that is already a repository layer;
- an abstraction with a single implementation and no second one in sight;
- an event bus for two synchronous callers;
- a generic solution for one concrete case;
- a shared package created for one shared function;
- a cache added before a measurement;
- a queue added to hide a slow query;
- configurable behaviour nobody has asked to configure.

Refused outright, whatever the force: a dependency direction stated in a
document with no check that enforces it.

Each of these is a real cost paid today against a benefit that may never
arrive. The correct response is to name the trigger that would justify it
later.

## 4. Detecting existing damage

| Symptom | Underlying defect | Repair |
|---|---|---|
| a change requires editing five files in five layers | layering without responsibility | collapse the layers that add no decision |
| two modules import each other | circular dependency | extract the shared concept or invert one direction |
| business rules appear in handlers and in services | duplicated ownership | one owner, the other calls it |
| a utility file exceeds a few hundred lines | no owner, a dumping ground | split by domain, not by technical kind |
| a table is written by three modules | no data owner | one writer, others go through it |
| adding a case requires touching a switch in four files | missing polymorphism or missing single source | one table of cases |
| the same query appears in six places | leaked persistence | move it behind the data owner |

Damage is reported with its repair cost. It is repaired inside the current
task only when it blocks the current task, otherwise it goes to continuity as
named follow up work.

## 5. Deliverable

```
Existing architecture   layers, dependency direction, current violations
Forces                  constraint, load, failure cost, change rate
Decision                the chosen shape, in one sentence
Ownership               who owns what data and what behaviour
Dependency direction    the ordered list, the check that enforces it, and
                        its listed exceptions
Contracts               input, output, invariants, failures per boundary
Failure model           timeout, retry, degradation per dependency
Rejected options        each with the reason and the trigger that would
                        change the answer
Reversal cost           what it takes to undo this
```

## 6. Auto-critique

Score from 0 to 5: fidelity to the architecture that exists, honesty of the
forces, single ownership of every responsibility, dependency direction written
down and enforced by a check, completeness of the failure
model, minimality of the chosen shape, quality of the rejected options,
clarity of the reversal cost.

Threshold: no axis below 3, average at least 4. A design whose failure model
is empty scores 0 on that axis and is redone.

## 7. Interfaces

- Upstream: `project-exploration`, `engineering-orchestrator`.
- Downstream: `backend-engineering`, `frontend-engineering`,
  `fullstack-engineering`, `dependency-selection`.
- Verified by: `code-review-protocol` architecture section.
- Recorded by: `technical-documentation`, `project-continuity`.
