# Example: an editor plugin that updated itself into a broken state

A small team ships a plugin for a desktop editor. Users install it two ways: by
copying a release folder into the editor's plugin directory, or through an
integration pack that a third party maintains with its own package manager.
Version 2.4.0 added an in-app update button: download the new archive, unpack
it over the plugin directory, reload.

## What went wrong in the first month

| Report | What had happened |
|---|---|
| "the plugin vanished after an update" | the laptop went to sleep while the archive was being unpacked; half the files were new, half old; the editor refused to load a plugin whose modules no longer matched |
| "it updates, then the pack reinstalls the old one" | on pack installations, the plugin and the pack's package manager both wrote the same directory; each undid the other, and one user ended with a lockfile pointing at a version that no longer existed |
| "an update notice opened a strange page" | the news feed shown in the settings page rendered its HTML as given; nothing malicious had been sent, but nothing would have stopped it |
| "I installed it from the package registry and updates fail" | a same-named package on a public registry, not published by the team, had different files; the hash check would have caught it, but there was none |

## What the updater became

```
mode        the installer writes a distribution marker: self or managed; a
            managed installation hides the update button, stops polling the
            feed, and says the pack owns updates
manifest    a signed JSON manifest lists each artefact with size and SHA-256,
            the editor versions supported, the minimum version an update can
            start from, and a withdrawn list; the public key ships inside the
            plugin
staging     the archive downloads into a staging folder next to the plugin
            directory, on the same disk, and is unpacked and hashed there
swap        the current plugin directory is renamed to a backup, a journal
            marker is written, the staged directory is renamed into place;
            two renames, no partial state
health      the editor's own reload sequence loads the new version, which must
            register its commands and answer one internal call; failure puts
            the backup back with the same two renames
recovery    at editor start, a leftover marker resolves the interrupted update
            before the plugin's own code runs
feed        announcement bodies render through a short allowlist of tags,
            with no script, no inline handler and no link that installs
```

## The release check that now runs

| Case | Expected |
|---|---|
| fresh install of 2.6.0 | starts |
| update from 2.4.0 and 2.5.x | 2.6.0 running, one backup kept |
| editor killed between the two renames | next start restores a whole version |
| archive with one byte changed | refused, 2.5.x still running |
| manifest signed with another key | refused, alert recorded |
| manifest for 2.3.0 served to 2.5.x | refused as a replay |
| managed installation | no update offered, directory never written |

The team also lists, in its README, the two channels it publishes through, and
warns that a same-named package elsewhere is not theirs.
