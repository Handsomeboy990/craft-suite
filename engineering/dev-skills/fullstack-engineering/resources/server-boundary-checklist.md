# Server boundary checklist

For full-stack frameworks where the server is reached through functions,
actions or loaders rather than routes written by hand. The framework makes the
call look local; it is still a request from the network. Apply per feature,
before the layer completion matrix is filled.

## Every server function and server action

```
schema         declared at the definition, parsed before any field is read
authentication declared at the definition, rejected before any work
authorization  declared at the definition, on the object and on its parent
create path    the same membership or ownership check as the update path
identity       taken from the session, never from an argument
visibility     drafts, private and deleted rows filtered from the session,
               never from an argument
ownership      in the query where the store allows it; a miss is not found
counters       incremented by the store, never read and set
```

A reviewer reads the definition and sees all of the first three lines without
opening the body. When one is missing, the function is public.

## Shared schemas

```
pure           a schema shared by the form and the server holds rules only:
               types, lengths, formats, allowed values
no effects     a rule that fetches a URL, queries the database or calls a
               service does not belong in a shared schema; on the server it
               becomes a request the caller controls
one source     the client parses with a subset of the server rules, never a
               superset
```

## Generated code

```
types          generated from the schema of record before dev and before build
clients        generated from the server's published specification
hand edits     none; a generated file changed by hand is overwritten silently
direction      clients depend on schema and generated client, never on server
               internals, checked by an import rule
```

## Framework configuration

```
build gates    type errors and lint errors fail the build; the flags that
               ignore them stay off
images         remote images only from named hosts; SVG through the optimiser
               off unless it is sanitised; never a wildcard host
server-only    a module holding a write credential is marked server-only and
               throws at load when its secret is missing
public prefix  no secret carries the prefix that exposes a variable to the
               browser
runtime        a stable framework and runtime release in a deliverable, per
               `dependency-selection`
```

## Rendering user content

```
markdown       rendered, then sanitised with an allowlist, then injected
rich text      the same; the parser's defaults are not a sanitiser
links          scheme allowlist, so a user link cannot run script
```

## Expensive and anonymous paths

```
model calls    session required, rate limited, output parsed with the input
               schema, prompts and answers kept out of the logs, per
               `llm-integration`
anonymous      every anonymous create (a submission, a contact form) is rate
               limited, per `rate-limiting`
expiring rows  each table of expiring rows has a cleanup job
```

## Reading the result

Every line holds, or is `n/a` with a reason. A line that does not hold is a
defect fixed before the feature is declared done, not a note in the handover.
