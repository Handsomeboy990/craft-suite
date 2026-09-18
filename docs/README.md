# docs

Design reasoning and history. Not usage.

The repository keeps two documentation directories, and the difference matters
when you are looking for something.

| Directory | Answers | Written for |
|---|---|---|
| `documentation/` | what the suite is, how to install it, configure it and use it | anyone using the suite |
| `docs/` | why it is shaped this way, what was assessed, what is planned | anyone changing its shape |

A reader who only wants to use the suite never needs this directory. Start at
[../documentation/usage.md](../documentation/usage.md).

## What is here

| File | Contents |
|---|---|
| `ROADMAP.md` | internal planning: what is left to build, by phase, ticked when it lands on `dev` |
| `agents/README.md` | entry point for the agent architecture: what exists, what is deferred, how to install only what is needed |
| `architecture/AGENT_ARCHITECTURE.md` | the layered architecture, the agents by group, the agent contract, safety |
| `architecture/ORCHESTRATION.md` | the three orchestrators, their gates, and safety against runaway orchestration |
| `architecture/MODEL_ROUTING.md` | why model routing is shaped the way it is, and what capability it refuses to claim |
| `architecture/TOKEN_OPTIMIZATION.md` | the seam between the during-the-work discipline and the after-the-fact measurement |
| `architecture/SKILL_AGENT_MATRIX.md` | which agents a given workflow uses, in multi-agent mode |
| `architecture/multi-agent-assessment.md` | a historical record of one assessment, kept as written |

## Reading a historical record

`multi-agent-assessment.md` is dated by its content, not by a header. It
records what was true when it was written, including its counts. It is not
updated as the repository grows, because a record that is edited afterwards
stops being a record. When it disagrees with `agents/README.md` about how many
agents exist, `agents/README.md` is right.

The same applies to `ROADMAP.md` in the other direction: an unticked line means
the work has not landed on `dev`, not that it is impossible. `CONTINUITY.md` at
the repository root records what was actually done.
