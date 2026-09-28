# Routing policy

The tier to identifier mapping, and where it is configured. This file is
reference data for `SKILL.md` section 4; it is read, never restated.

## Tier to identifier

```yaml
model_routing:
  fast: ""        # empty: see "What an absent or empty section means" below
  balanced: ""    # empty: see "What an absent or empty section means" below
  strongest: ""   # empty: see "What an absent or empty section means" below
```

This is what `config/craft.config.example.yaml` ships, and what a fresh
project's configuration has until someone fills it in.

An explicit override:

```yaml
model_routing:
  fast: "haiku"
  balanced: "sonnet"
  strongest: "opus"
```

The values are the same short names the agent dispatch mechanism accepts,
never a full versioned identifier, because a versioned identifier is exactly
the kind of value that goes stale. A project pinning a specific version does
so in its own configuration, with its own justification, not by editing this
skill.

## What an absent or empty `model_routing` section means

This section exists because the obvious assumption is wrong. On Claude Code,
a subagent dispatch with no `model` parameter does not fall back to a
sensible per-tier default; it inherits the orchestrating session's own
model. That is verified against this runtime's own tool definitions, not
assumed.

The consequence, if left unhandled: if `model_routing` is absent from the
project's configuration, or present with one or more of its three values left
empty, and the orchestrator treats that as "the runtime will sort it out,"
every dispatch silently runs on whatever model the orchestrating session
itself happens to be running on. The routing tier this skill computed,
`fast`, `balanced` or `strongest`, never reaches the dispatch at all, and
nothing signals the gap: a `fast`-tier dispatch and a `strongest`-tier
dispatch look identical in the transcript, both inheriting the same session
model, and the budget or the quality consequence shows up later with no link
back to a routing decision that was supposed to have prevented it.

This skill does not accept that as a graceful default. When `model_routing`
is absent, or present but empty for the tier a dispatch needs, the
orchestrator applies this documented default mapping instead of inheriting
silently:

```
fast       -> haiku
balanced   -> sonnet
strongest  -> opus
```

Concretely, on every affected dispatch:

1. The orchestrator resolves the tier through this default mapping, exactly
   as if the project had written it into its own configuration.
2. The routing announcement, `SKILL.md` section 8, states plainly that the
   default mapping was applied because the configuration was absent or
   empty, rather than silently proceeding as if a project-specific value had
   been read.
3. The dispatch is recorded in the routing log, `resources/routing-log.md`,
   with the resolved model marked as the default mapping in the Resolved
   model column, so a later reader can see that no project-specific choice
   was made here.

A project that genuinely wants every dispatch to inherit the orchestrating
session's own model states that explicitly in its own documentation and
delegation record, per `config/README.md`; it is a choice the project makes
on the record, never a silent fallback this skill assumes on the project's
behalf.

## Why no identifier ships hardcoded in the routing table

This is a different question from the default mapping above, which exists
precisely so the fallback is explicit rather than silent. What stays free of
a hardcoded identifier is the routing table in `SKILL.md` section 3, which
maps a complexity tier to a model tier, `fast`, `balanced` or `strongest`,
never to a real name. Three reasons, all from `engineering-core` section 1
and section 6 of the repository's own rules:

1. Model availability differs by account and by time. A skill hardcoding an
   identifier becomes silently wrong the day that identifier is retired,
   without any error to signal it.
2. The suite is distributed to users whose available models this repository
   cannot know in advance.
3. A project-specific override belongs in that project's configuration, not
   in a shared skill every project reads.

The default mapping above is not an exception to this: it is a named,
documented, announced fallback, visible in the routing log and swapped for a
project's own values the moment that project sets them, rather than an
identifier quietly assumed correct forever.

## What is fixed, not configurable

The three tier names, `fast`, `balanced`, `strongest`, and the routing table
in `SKILL.md` section 3 that maps a complexity tier to a model tier. These are
policy, agreed once, and not meant to drift per project. What is configurable
is which real model answers to each tier name on a given account.

## Effort vocabulary

Where a target skill exposes an effort parameter, this suite uses the same
five names throughout rather than inventing a second vocabulary: `low`,
`medium`, `high`, `xhigh`, `max`. A skill with fewer effort levels than five
maps the nearest one down; a skill with no effort parameter at all is routed
by model tier alone, per `SKILL.md` section 1.
