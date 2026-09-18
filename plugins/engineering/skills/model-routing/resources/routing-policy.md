# Routing policy

The tier to identifier mapping, and where it is configured. This file is
reference data for `SKILL.md` section 4; it is read, never restated.

## Tier to identifier

```yaml
model_routing:
  fast: ""        # empty means: use the fastest model available on this account
  balanced: ""    # empty means: use the mid tier model available on this account
  strongest: ""   # empty means: use the strongest model available on this account
```

Default behaviour, when a value is left empty: the skill names the tier in
its routing announcement and leaves the actual model selection to whichever
mechanism resolves an empty configuration value on this runtime, rather than
guessing an identifier that may not exist on this account or may have been
retired since this file was last updated.

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

## Why no identifier ships hardcoded here

Three reasons, all from `engineering-core` section 1 and section 6 of the
repository's own rules:

1. Model availability differs by account and by time. A skill hardcoding an
   identifier becomes silently wrong the day that identifier is retired,
   without any error to signal it.
2. The suite is distributed to users whose available models this repository
   cannot know in advance.
3. A project-specific override belongs in that project's configuration, not
   in a shared skill every project reads.

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
