# Host compatibility checklist

Run before every release of a plugin, and before widening its supported host
range. Each line is a check with the evidence that answers it.

## Contract

- [ ] Every extension point the plugin uses is listed with the host versions
      that provide it.
- [ ] Every observed quirk is recorded with the host version, the date and the
      symptom it caused.
- [ ] No import of the host outside the seam module: a search of the source for
      the host's package names finds only the seam.
- [ ] Every private host path still in use is listed as a risk with the versions
      tested.

## Range

- [ ] The minimum and maximum supported host versions are declared in the
      manifest.
- [ ] Activation outside the range refuses, with a message naming the range.
- [ ] The suite ran on the minimum, the maximum and the newest host version,
      with the versions written in the release record.

## Lifecycle

- [ ] Activation, reload twice, deactivation: the count of listeners, timers,
      routes, commands and watchers returns to its value before activation.
- [ ] A second activation registers nothing twice.
- [ ] Each late service, started after the plugin, is picked up.
- [ ] Each optional service, absent, leaves the plugin active with that feature
      reported unavailable.

## Containment

- [ ] A hook that throws leaves the host running and the error recorded.
- [ ] A hook slower than its timeout is abandoned and the host path completes.
- [ ] No host prototype, global function or shared module is patched, or the
      patch is scoped and removed on deactivation.

## Values

- [ ] Every value handed to the host is a plain, serialisable object in the
      shape the host reads.
- [ ] Every number handed over is finite and in range, checked in code.

## Storage and privileges

- [ ] State lives under the plugin's namespace with a schema version.
- [ ] Credentials are stored owner-readable only, outside any shared settings
      document.
- [ ] Routes added to a host server authenticate and check the origin.
- [ ] No code is fetched and executed at runtime outside a verified update.
- [ ] Identifiers, commands, routes and storage keys are namespaced.
- [ ] The plugin is registered through one mechanism, as the host documents.
