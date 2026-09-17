#!/usr/bin/env bash
# Generate the per-domain plugin bundles from the canonical skill trees.
#
# The trees under writing/, documents/, engineering/, security/, research/,
# career/ and opportunity/ are the single source of truth. Each plugin under
# plugins/<domain>/skills is generated from them by this script, using the same
# installer that populates ~/.claude/skills, so a plugin contains exactly the
# skills that scope would install, dependencies resolved, plus the cross domain
# pair. Each domain also receives its own agents: engineering its delivery team,
# security its auditors. A domain with no agent of its own gets no agents/ dir.
#
# Run this after adding or changing a skill, so the plugin bundles stay in sync
# with the trees. tests/validate-plugins.sh checks that they are.
#
#   bash plugins/build.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INSTALL="$ROOT/install.sh"

# domain directory -> installer scope flag
DOMAINS="writing:--writing
documents:--documents
engineering:--dev
security:--security
research:--research
career:--career
opportunity:--opportunity"

built=0
printf '%s\n' "$DOMAINS" | while IFS=: read -r dir scope; do
  [ -n "$dir" ] || continue
  plugin="$ROOT/plugins/$dir"
  [ -f "$plugin/.claude-plugin/plugin.json" ] || {
    printf 'skip %s: no plugin.json\n' "$dir"; continue; }

  # Clean and repopulate the skills and agents directories for this domain.
  # Each domain installs its own agents; the installer emits only the agents
  # that belong to the domain's scope, so an empty agents/ dir means the domain
  # owns none, and is dropped.
  rm -rf "$plugin/skills" "$plugin/agents"
  mkdir -p "$plugin/skills" "$plugin/agents"
  CLAUDE_SKILLS_DIR="$plugin/skills" \
  CLAUDE_AGENTS_DIR="$plugin/agents" \
    bash "$INSTALL" "$scope" >/dev/null 2>&1

  acount="$(find "$plugin/agents" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')"
  [ "$acount" -eq 0 ] && rm -rf "$plugin/agents"

  count="$(find "$plugin/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')"
  if [ "$acount" -gt 0 ]; then
    printf 'built %-14s %3s skills, %s agents\n' "$dir" "$count" "$acount"
  else
    printf 'built %-14s %3s skills\n' "$dir" "$count"
  fi
done

printf 'Plugin bundles generated under plugins/.\n'
