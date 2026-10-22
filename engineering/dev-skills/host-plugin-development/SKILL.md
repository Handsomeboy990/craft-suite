---
name: host-plugin-development
description: Builds a plugin or extension for a host the team does not control, an editor, an agent harness, a CMS, a browser, a CLI with a plugin system, so it keeps working as the host changes and never takes the host down: the host's real contract read and recorded, one seam module that alone touches the host, a declared and tested compatibility range, services requested and awaited rather than assumed at load, everything registered disposed, values handed to the host resolved and finite, failure contained so the host carries on, private storage, coexistence with other plugins and packaging modes, and tests against a stub host and the real minimum and maximum versions. Use for any plugin, extension, add-on, integration or module loaded by someone else's runtime.
license: MIT
metadata:
  category: dev-skills
  version: 1.0.0
  depends_on: [engineering-core]
  outputs: [host-contract-record, seam-module, compatibility-range, lifecycle-map, plugin-test-matrix]
---

# Host Plugin Development

A plugin runs inside a program its authors do not own. The host decides when it
loads, what it may call, what it stores and when it changes. The host also
ships new versions on its own schedule, and the plugin's users upgrade the host
without asking the plugin. A plugin is engineered for that: it depends on as
little of the host as it can, in one place, and it fails without taking the
host with it.

The host's behaviour is read from its documentation, its type definitions and,
where those are silent, its source, never assumed, per `engineering-core`
section 1. What the documentation does not say and a test showed is written down
with the host version and the date.

## 1. Record the host's real contract

```
surface     the extension points actually used: registration calls, hooks,
            events, services, storage, routes, with the host versions that
            provide each
lifecycle   when the plugin is loaded, activated, reloaded, deactivated and
            unloaded, and in what order relative to the host's own services
storage     which values the host stores as given and which it interprets; a
            value stored verbatim is read back exactly as it was handed over
observed    every behaviour learned by a failure rather than from the
            documentation, recorded with the host version, the date and the
            symptom it caused
```

## 2. One seam

```
seam        a single module is the only one allowed to import the host or its
            packages; everything else calls the plugin's own internal
            interface
versions    differences between host versions are handled inside the seam,
            never spread through the plugin as version checks
structural  where the host checks the shape of what it receives rather than
            its class, the plugin supplies a plain object of that shape instead
            of importing the host's base class, so it does not pin one host
            build
internals   no import of the host's private modules or undocumented paths;
            a capability only reachable that way is recorded as a risk with the
            host versions it was tested on
```

## 3. Declare and enforce compatibility

```
range       the minimum and maximum host versions supported are declared in
            the plugin's manifest, using the host's own field when it has one
check       at activation the plugin reads the running host version; outside
            the range it does not activate, and it says which range it needs
matrix      the release is tested on the minimum and the maximum supported
            host versions, and on the newest host version available
widen       the range is widened only after a test on the new version, never
            on the assumption that nothing changed
```

## 4. Lifecycle and services

```
request     every host service the plugin uses is requested explicitly, in
            the form the host provides for declaring dependencies
await       a service that may appear after the plugin loads (a web server, a
            user interface, a timer service) is waited for through the host's
            mechanism, not read once at load time and assumed absent if missing
optional    a service the plugin can live without degrades one feature when
            absent; the plugin still activates and says what is unavailable,
            so a headless host still gets the core of the plugin
dispose     every listener, timer, route, command, watcher and child process
            the plugin registers is released on deactivation; reload is the
            same sequence as deactivate then activate
idempotent  activating twice, which a reload can do, registers once; a
            duplicate registration is detected and refused, not repeated
```

## 5. Never take the host down

```
contain     an error inside a plugin hook is caught at the seam, recorded, and
            the host continues as if the hook had not run, unless the host's
            contract says the hook may block
fail open   a plugin step on the host's hot path (a request, a keystroke, a
            message) that fails or times out passes the original through
bounded     plugin work on a host path has a timeout shorter than the host's
            own, so the plugin is never the reason a host request hangs
globals     no patching of host prototypes, global functions or shared
            modules; where an integration cannot avoid it, the patch is scoped,
            checked for an existing patch, and removed on deactivation
```

## 6. Values handed to the host

The host may store what it receives as it is and read it much later, in code
the plugin never sees.

```
resolved    configuration, policies and options are handed over already
            resolved to plain values in the shape the host reads, not nested
            in a structure the host does not unpack
finite      every number is checked finite and in range before it is handed
            over; a computed NaN or an undefined field becomes a failure in
            the host, far from its cause
serialisable values the host persists are plain data; no function, no class
            instance, no cycle
```

## 7. State and storage

```
own space   the plugin's state lives under its own namespace or directory in
            the host's data location, with a schema version and a migration
secrets     credentials the plugin holds are stored readable by the owner
            only, never in a settings document the host shares with other
            plugins or syncs
leave clean uninstall instructions say what the plugin leaves behind and how
            to remove it
```

## 8. Coexistence

```
identity    the plugin's id, commands, routes and storage keys are namespaced
            so they cannot collide with another plugin's
once        the plugin is registered through one mechanism only; the host's
            documentation is followed on which, because two registrations of
            one plugin can fail or run it twice
packaging   when a package manager or an integration pack installs the
            plugin, the plugin's own updater and file writers stand down, per
            `self-updating-software`
headless    the user interface half is optional; the plugin works on a host
            composition that has none
```

## 9. Privileges

```
inherited   a plugin runs with the host's privileges on the user's machine;
            it requests the least capability the host lets it declare
routes      a route the plugin adds to a host's web server is authenticated
            and checks the request's origin like any other, per
            `session-security`
no remote   no code is fetched and executed at runtime outside a verified
            update; content fetched from the network is rendered as data
```

## 10. Test against a stub host and the real ones

```
stub        a stub host implements the recorded contract, including its
            observed quirks, so the suite runs fast and offline
lifecycle   activation, reload twice, deactivation: no leaked listener, timer
            or route after deactivation
services    each optional service absent, and each late service arriving
            after load
failures    a hook that throws, a slow hook, a non-finite value: the host
            keeps running and the failure is recorded
real        the matrix of section 3 on real host builds, run by hand or in CI,
            recorded with the host versions
```

`resources/host-compatibility-checklist.md` lists the checks before a release.

## 11. Prohibitions

- No host import outside the seam module, and no private host path used without
  a recorded risk.
- No activation outside the declared compatibility range, and no range widened
  without a test.
- No host service assumed present at load time when it can arrive later.
- No registration left behind after deactivation, and no duplicate
  registration on reload.
- No uncaught plugin error reaching the host, and no plugin step on a host hot
  path without a timeout.
- No nested, non-finite or non-serialisable value handed to the host.
- No credential in a settings document the host shares.
- No code fetched and executed at runtime outside a verified update.

## 12. Protocol

1. Read and record the host's contract for every extension point used, with the
   host versions that provide it.
2. Put every host import in one seam module behind an internal interface.
3. Declare the compatibility range, check it at activation, and plan the test
   matrix.
4. Request and await services, make optional ones degrade, and pair every
   registration with its disposal.
5. Contain errors at the seam, fail open on hot paths, bound plugin work with
   timeouts, and leave globals alone.
6. Resolve and validate every value handed to the host.
7. Keep state in the plugin's own namespace, secrets owner-readable, and
   namespaced identifiers.
8. Run the stub-host suite and the real-host matrix before release.

## 13. Auto-critique

Score from 0 to 5: the host contract is recorded with versions and observed
quirks; one seam module alone touches the host; the compatibility range is
declared, enforced and tested at both ends; late services are awaited and
optional ones degrade; every registration is disposed and reload registers
once; plugin errors are contained and hot paths fail open; values handed over
are resolved and finite; state and secrets live in the plugin's own space;
the suite covers the stub host and the real minimum and maximum.

Threshold: no axis below 3, average at least 4. A plugin whose failure can stop
the host from starting or serving, or that activates on a host version it was
never tested on, scores 0 overall: either one turns a host upgrade into an
outage the plugin's users cannot diagnose.

## 14. Interfaces

- Upstream: `engineering-core`, which requires reading the host's real
  contract rather than memory.
- Lateral: `self-updating-software` when the plugin updates itself,
  `secrets-management` for credentials it holds, `session-security` for routes
  it adds, `dependency-selection` before depending on a host package,
  `api-design` for the internal interface behind the seam,
  `llm-gateway-engineering` when the plugin is a model provider for a harness.
- Downstream: `regression-testing` for the host version matrix,
  `technical-documentation` for the installation and compatibility notes,
  `code-review-protocol`.
