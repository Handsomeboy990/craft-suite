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

"Tree" is how many skills the domain's own tree holds. "Bundle" is how many
directories are under `plugins/<domain>/skills` and therefore how many land on
disk: the tree, plus the two cross domain skills, plus any cross tree
dependency the tree's skills declare.

| Plugin | Installs | Tree | Bundle |
|---|---|---|---|
| `craft-writing` | the writing tree | 42 | 44 |
| `craft-documents` | the documents tree | 7 | 9 |
| `craft-engineering` | the engineering tree and its agents | 82 | 84 plus 24 agents |
| `craft-security` | the security tree and its agents | 12 | 18 plus 2 agents |
| `craft-research` | the research tree | 5 | 7 |
| `craft-career` | the career tree | 7 | 9 |
| `craft-opportunity` | the opportunity tree | 9 | 11 |

Install one:

```
/plugin install craft-security
```

Each plugin is self-contained. It carries the domain's skills, the two cross
domain skills that every tree calls, and any cross-tree dependency a skill
declares, resolved transitively, so no skill installs broken.

Today exactly one bundle needs that last clause, which is why only its two
counts differ by more than two. `security/security-assurance/vulnerability-assessment`
declares `depends_on: [security-core, security-audit]`, and `security-audit`
lives in `engineering/dev-skills`. The security bundle therefore also carries
`security-audit` and the three skills it declares in turn, `engineering-core`,
`project-exploration` and `input-validation`. Every other bundle is its tree
plus the shared pair.

## How the bundles are built

The trees are the single source of truth. The plugin bundles under `plugins/`
are generated from them, never edited by hand:

```bash
bash plugins/build.sh
```

For each domain, the script runs the same installer that populates
`~/.claude/skills`, targeting the plugin's `skills/` directory. A plugin
therefore contains exactly the set that scope would install, dependencies and
all. Each domain also receives its own agents: the engineering plugin its
24-agent delivery team, the security plugin its 2 auditors, `security-engineer`
and `web-auditor`. A domain that owns no agent gets no `agents/` directory.

Because the bundles are generated, they can drift from the trees if someone adds
a skill or an agent and forgets to rebuild. `tests/validate-plugins.sh` prevents
that: it regenerates the expected skills and agents for each domain into a
sandbox and compares them to what is committed, failing if they differ. The CI
runs it on every pull request.

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
