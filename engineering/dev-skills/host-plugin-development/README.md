# host-plugin-development

Builds a plugin or extension for a host the team does not control, an editor,
an agent harness, a CMS, a browser, a CLI with a plugin system, so it keeps
working as the host changes and never takes the host down: the host's contract
recorded, one seam module that alone touches the host, a declared and tested
compatibility range, services awaited rather than assumed, everything
registered disposed, values handed over resolved and finite, failures
contained, private storage, coexistence, and tests against a stub host and the
real minimum and maximum versions.

- Inputs: the host, its documentation, type definitions and source, the host
  versions the plugin must support, the extension points it needs.
- Outputs: the host contract record, the seam module, the compatibility range,
  the lifecycle map, the plugin test matrix.
- Depends on: engineering-core.

The host loads the plugin when it decides, stores what it receives as given,
and ships new versions on its own schedule. So the plugin depends on as little
of the host as it can, in one place: a seam module absorbs the differences
between host versions; services that arrive after load are awaited instead of
read once; every number handed to the host is checked finite, because a value
stored verbatim fails far from its cause; and an error in a hook is caught so
the host carries on. The behaviours the documentation did not state, learned
from a failure, are recorded with the host version and the date.

No configuration field: the supported host range belongs to the plugin's
manifest.
