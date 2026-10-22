# Example: a provider plugin that stopped activating after a host update

A team maintains a plugin that adds a model provider to an agent harness. The
harness loads plugins at start, offers services (a timer, a web server for the
settings page, the model registry) and is released every few weeks. The plugin
supports two harness versions. Three failures arrived in one release cycle, all
after harness updates, none reproducible on the developers' own setup at first.

## Failure 1: transient errors became aborted turns

Symptom: on a busy provider, a recoverable error aborted the whole turn instead
of retrying.

Found: the plugin returned its retry policy with the delays nested under a
`backoff` key. The harness stored the policy as given and its scheduler read
the delays from the top level, found nothing, and computed `undefined * 2^n`,
which is NaN. The harness's session log refused a non-finite number, and the
turn ended.

Fixed: the seam builds the policy as flat, resolved numbers in the shape the
scheduler reads, and asserts each is finite before handing it over. The quirk
is recorded: "policy stored verbatim, read flat; observed on both supported
versions".

## Failure 2: the plugin no longer activated at all

Symptom: after trimming its declared service list to the one service it truly
required, the plugin stopped activating on every host composition.

Found: the plugin still checked for another service by reading it as a
property. In this harness, reading an undeclared service as a property throws,
rather than returning nothing. The throw happened during activation.

Fixed: every service is read through the seam, which uses the host's lookup
call for optional services and never touches an undeclared one as a property.
The stub host reproduces the throwing behaviour, so the test fails the same way
the harness did.

## Failure 3: the settings page had no data

Symptom: the plugin activated, served its models, and its settings page loaded
empty.

Found: the plugin looked up the web server service once, at load time, and the
lookup returned nothing. The harness did have a web server; it was published by
the user interface half, which loads after plugins. The plugin concluded the
host was headless and never registered its routes.

Fixed: the routes are registered through the host's mechanism for waiting on a
service, in their own activation branch. A host with no web server never
triggers that branch, and the core of the plugin runs without it. Both cases are
in the suite: a late service, and an absent one.

## The test matrix after the cycle

| Case | Expected |
|---|---|
| older and newer supported harness, fresh start | active, models listed |
| web server published after the plugin loads | routes registered when it arrives |
| no web server at all | active, settings page reported unavailable |
| undeclared service never read as a property | activation succeeds on the stub that throws |
| retry policy handed over | flat, every value finite |
| reload twice, then deactivate | no route, timer or listener left |
| harness version above the declared range | refuses to activate, names the range |

The supported range stays at the two tested versions. It is widened when the
next harness release has run through this matrix, not before.
