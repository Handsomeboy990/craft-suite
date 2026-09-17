# Plugins

The suite ships two ways. The installer, `install.sh`, is the original path and
still works unchanged. The plugins are a second path, for users who install
Claude Code capabilities through a marketplace and want only some domains.

## Adding the marketplace

```
/plugin marketplace add Handsomeboy990/craft-suite
```

This reads `.claude-plugin/marketplace.json` at the repository root, which lists
one plugin per domain.

## The plugins

| Plugin | Installs | Skills |
|---|---|---|
| `craft-writing` | the writing tree | 42 plus the shared pair |
| `craft-documents` | the documents tree | 7 plus the shared pair |
| `craft-engineering` | the engineering tree and its agents | 70 plus 18 agents |
| `craft-security` | the security tree | 10 plus dependencies |
| `craft-research` | the research tree | 5 plus the shared pair |
| `craft-career` | the career tree | 7 plus the shared pair |
| `craft-opportunity` | the opportunity tree | 9 plus the shared pair |

Install one:

```
/plugin install craft-security
```

Each plugin is self-contained. It carries the domain's skills, the two cross
domain skills that every tree calls, and any cross-tree dependency a skill
declares, resolved transitively, so no skill installs broken. The security
plugin, for example, carries `security-audit` and `security-testing` from the
engineering tree because the security skills reference them.

## How the bundles are built

The trees are the single source of truth. The plugin bundles under `plugins/`
are generated from them, never edited by hand:

```bash
bash plugins/build.sh
```

For each domain, the script runs the same installer that populates
`~/.claude/skills`, targeting the plugin's `skills/` directory. A plugin
therefore contains exactly the set that scope would install, dependencies and
all. The engineering plugin also receives the 18 agents.

Because the bundles are generated, they can drift from the trees if someone adds
a skill and forgets to rebuild. `tests/validate-plugins.sh` prevents that: it
regenerates the expected set for each domain into a sandbox and compares it to
what is committed, failing if they differ. The CI runs it on every pull request.

## When you change a skill

1. Edit the skill in its tree, the canonical location.
2. Run the four validators in `tests/`.
3. Run `bash plugins/build.sh` to regenerate the affected bundles.
4. Commit the tree change and the regenerated bundle together.

The rule is simple: never edit a file under `plugins/`. Edit the tree, then
rebuild.

## Why generated, not hand-maintained

A per-domain plugin needs its skills present under its own `skills/` directory,
which the marketplace copies on install. Keeping a second hand-written copy of
every skill would guarantee the two drift. Generating the copies from one source,
with a sync check, keeps the trees authoritative and the plugins honest.
