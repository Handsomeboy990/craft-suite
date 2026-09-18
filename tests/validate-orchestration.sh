#!/usr/bin/env bash
# Verifies orchestration coherence: execution plans, delivery phases, cross
# references, mandatory gates, reference routing scenarios, agent definitions
# and the document pipeline.
# Usage: bash tests/validate-orchestration.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="$ROOT/engineering"
DEV="$ENG/dev-skills"
DELIVERY="$ENG/delivery-skills"
DEVOPS="$ENG/devops-skills"
AGENTS="$ROOT/agents"
AGENT_GROUPS="core development design security testing documentation devops research"
ORCH="$DEV/engineering-orchestrator"
PLANS="$ORCH/resources/execution-plans.md"
PHASES="$DELIVERY/delivery-orchestrator/resources/delivery-phases.md"
ENGINEERING_CATEGORIES="dev-skills delivery-skills devops-skills"

# Every group holding skills, so a cross reference resolves across trees.
ALL_GROUPS="writing/core writing/genres writing/poetry writing/quality
documents/documentation documents/administrative documents/publishing
engineering/dev-skills engineering/delivery-skills engineering/devops-skills
security/secure-development security/security-assurance
research career
opportunity/ideation opportunity/hackathons opportunity/business
shared"

# Groups whose SKILL.md carries an Interfaces section.
PROCEDURAL_GROUPS="documents/documentation documents/administrative
documents/publishing engineering/dev-skills engineering/delivery-skills
engineering/devops-skills
security/secure-development security/security-assurance
research career
opportunity/ideation opportunity/hackathons opportunity/business
shared"

ERRORS=0

CATEGORIES="EXPLORATION ARCHITECTURE FRONTEND BACKEND FULLSTACK DATABASE API
AUTHENTICATION SECURITY VALIDATION DEBUGGING PERFORMANCE UI_UX TESTING
BROWSER_AUTOMATION DOCUMENTATION GIT RELEASE REFACTORING DEPENDENCY
QUALITY_CAMPAIGN ACCESSIBILITY REGRESSION MIGRATION LEGACY INCIDENT
INFRASTRUCTURE PAYMENTS JOBS REALTIME FILES I18N SEO DESIGN_SYSTEM PRIVACY
CACHING ANALYTICS FEATURE_FLAGS"

AGENT_NAMES="delivery-orchestrator principal-engineer requirements-analyst
software-architect frontend-engineer backend-engineer database-engineer
security-engineer qa-engineer playwright-engineer ui-ux-engineer
devops-engineer performance-engineer documentation-engineer release-engineer
incident-responder compliance-verifier design-verification web-auditor pr-author pr-reviewer design-research
source-of-truth checkup final-verifier"

fail() {
  printf 'ERROR   %s\n' "$1"
  ERRORS=$((ERRORS + 1))
}

# Path of a skill in any tree. Uses its own loop variable so a caller
# iterating over group or category is not silently rewritten.
skill_dir() {
  for _group in $ALL_GROUPS; do
    if [ -d "$ROOT/$_group/$1" ]; then
      printf '%s\n' "$ROOT/$_group/$1"
      return 0
    fi
  done
  return 1
}

# Path of an agent definition in any group under agents/. Uses its own loop
# variable for the same reason as skill_dir.
agent_file() {
  for _agroup in $AGENT_GROUPS; do
    if [ -f "$AGENTS/$_agroup/$1.md" ]; then
      printf '%s\n' "$AGENTS/$_agroup/$1.md"
      return 0
    fi
  done
  return 1
}

plan_of() {
  awk -v cat="category: $1" '
    $0 == cat { found = 1; next }
    found && /^plan: / { sub(/^plan: /, ""); print; exit }
  ' "$PLANS"
}

# Steps of a plan, one per line.
steps_of() {
  printf '%s\n' "$1" | sed 's/->/\n/g' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
    | grep -v '^$'
}

# Position of a step in a plan, empty when absent.
position_in() {
  steps_of "$1" | grep -n "^$2$" | head -n 1 | cut -d: -f1
}

# Whether a plan contains a step.
contains() {
  steps_of "$1" | grep -qx "$2"
}

# Verifies the given steps are present, in this order.
ordered() {
  category="$1"; scenario="$2"; shift 2
  plan="$(plan_of "$category")"
  previous=0
  for step in "$@"; do
    index="$(position_in "$plan" "$step")"
    if [ -z "$index" ]; then
      fail "$scenario: step missing from plan $category: $step"
      return
    fi
    if [ "$index" -le "$previous" ]; then
      fail "$scenario: wrong order in $category, $step comes too early"
      return
    fi
    previous="$index"
  done
}

printf 'Check 1: system files present\n'
for d in "$DEV" "$DELIVERY" "$DEVOPS" "$AGENTS"; do
  [ -d "$d" ] || { fail "missing directory: ${d#"$ROOT"/}"; exit 1; }
done
for f in "$DEV/README.md" "$DELIVERY/README.md" "$DEVOPS/README.md" \
         "$AGENTS/README.md" "$AGENTS/handoff-protocol.md" \
         "$ORCH/SKILL.md" "$ORCH/resources/routing-table.md" \
         "$DEV/engineering-core/SKILL.md" "$DEVOPS/devops-core/SKILL.md"; do
  [ -f "$f" ] || fail "missing file: ${f#"$ROOT"/}"
done
[ -f "$PLANS" ] || { fail "execution-plans.md missing"; exit 1; }
[ -f "$PHASES" ] || { fail "delivery-phases.md missing"; exit 1; }

printf 'Check 2: one classification and one plan per task category\n'
for category in $CATEGORIES; do
  grep -q "^| $category |" "$ORCH/SKILL.md" \
    || fail "category missing from the classification table: $category"
  count="$(grep -c "^category: $category$" "$PLANS" || true)"
  [ "$count" -eq 1 ] \
    || fail "category $category: $count plan declarations instead of 1"
  [ -n "$(plan_of "$category")" ] \
    || fail "category $category: plan line missing"
done

printf 'Check 3: every plan step names a real skill\n'
for category in $CATEGORIES; do
  plan="$(plan_of "$category")"
  [ -n "$plan" ] || continue
  while IFS= read -r step; do
    [ -n "$step" ] || continue
    skill_dir "$step" >/dev/null || fail "plan $category: unknown skill, $step"
    case "$step" in
      engineering-core|engineering-orchestrator)
        fail "plan $category: $step must not appear in a plan"
        ;;
    esac
  done < <(steps_of "$plan")
done

printf 'Check 4: mandatory gates in plans\n'
for category in $CATEGORIES; do
  plan="$(plan_of "$category")"
  [ -n "$plan" ] || continue
  # Every plan begins with exploration, except INCIDENT: production is
  # restored before the codebase is understood.
  first_step="$(steps_of "$plan" | head -n 1)"
  case "$category" in
    INCIDENT)
      [ "$first_step" = "incident-response" ] \
        || fail "plan INCIDENT: does not begin with incident-response" ;;
    *)
      [ "$first_step" = "project-exploration" ] \
        || fail "plan $category: does not begin with project-exploration" ;;
  esac

  implements=0
  for skill in backend-engineering frontend-engineering fullstack-engineering; do
    contains "$plan" "$skill" && implements=1
  done

  if [ "$implements" -eq 1 ]; then
    for gate in testing-quality code-review-protocol project-continuity git-workflow; do
      contains "$plan" "$gate" \
        || fail "plan $category: mandatory gate missing, $gate"
    done
  fi

  if contains "$plan" "ui-ux-engineering" && contains "$plan" "frontend-engineering"; then
    a="$(position_in "$plan" ui-ux-engineering)"
    b="$(position_in "$plan" frontend-engineering)"
    [ "$a" -lt "$b" ] \
      || fail "plan $category: ui-ux-engineering must precede frontend-engineering"
  fi

  if contains "$plan" "project-continuity" && contains "$plan" "git-workflow"; then
    a="$(position_in "$plan" project-continuity)"
    b="$(position_in "$plan" git-workflow)"
    [ "$a" -lt "$b" ] \
      || fail "plan $category: project-continuity must precede git-workflow"
  fi

  if contains "$plan" "release-readiness"; then
    last="$(steps_of "$plan" | tail -n 1)"
    [ "$last" = "release-readiness" ] \
      || fail "plan $category: release-readiness must be the last step"
  fi
done

for category in SECURITY AUTHENTICATION; do
  contains "$(plan_of "$category")" "security-audit" \
    || fail "plan $category: security-audit is mandatory"
done
contains "$(plan_of API)" "technical-documentation" \
  || fail "plan API: technical-documentation is mandatory on a contract change"
contains "$(plan_of DEPENDENCY)" "dependency-selection" \
  || fail "plan DEPENDENCY: dependency-selection is mandatory"

printf 'Check 5: reference routing scenarios\n'
ordered DEBUGGING "scenario A, bug in an API" \
  project-exploration debugging backend-engineering testing-quality \
  code-review-protocol
ordered FRONTEND "scenario B, new dashboard page" \
  project-exploration ui-ux-engineering frontend-engineering input-validation \
  testing-quality playwright-automation performance-engineering \
  code-review-protocol
ordered BACKEND "scenario C, payment endpoint" \
  project-exploration architecture-design backend-engineering input-validation \
  security-audit testing-quality code-review-protocol
ordered SECURITY "scenario D, authentication review" \
  project-exploration security-audit code-review-protocol \
  technical-documentation
contains "$(plan_of SECURITY)" "testing-quality" \
  || fail "scenario D: testing-quality missing from plan SECURITY"
ordered FULLSTACK "scenario E, complete feature" \
  project-exploration architecture-design fullstack-engineering \
  input-validation security-audit testing-quality playwright-automation \
  code-review-protocol technical-documentation project-continuity \
  git-workflow release-readiness

printf 'Check 6: delivery phases\n'
expected_phase=1
while IFS= read -r number; do
  actual=$((10#$number))
  [ "$actual" -eq "$expected_phase" ] \
    || fail "phase $number: non sequential numbering, expected $expected_phase"
  expected_phase=$((expected_phase + 1))
done < <(grep '^phase: ' "$PHASES" | awk '{print $2}')
[ "$expected_phase" -eq 15 ] \
  || fail "delivery-phases.md: $((expected_phase - 1)) phases instead of 14"

while IFS= read -r line; do
  for skill in $(printf '%s' "$line" | sed 's/^skills: //; s/,/ /g'); do
    skill_dir "$skill" >/dev/null \
      || fail "delivery-phases.md: unknown skill in a phase, $skill"
  done
done < <(grep '^skills: ' "$PHASES")

for phase in 02 05 10 14; do
  gate="$(awk -v p="phase: $phase" '
    $0 == p { found = 1; next }
    found && /^gate: / { print $2; exit }
  ' "$PHASES")"
  [ "$gate" = "approval" ] \
    || fail "phase $phase: expected gate approval, found ${gate:-none}"
done

grep -q '^skills: .*validation-gate' "$PHASES" \
  || fail "delivery-phases.md: validation-gate missing from the phases"
grep -q '^skills: .*requirements-analysis' "$PHASES" \
  || fail "delivery-phases.md: requirements-analysis missing from the phases"
grep -q '^skills: .*production-verification' "$PHASES" \
  || fail "delivery-phases.md: production-verification missing from the phases"

printf 'Check 7: no orphan engineering skill\n'
for category in $ENGINEERING_CATEGORIES; do
  for skill in "$ENG/$category"/*/; do
    name="$(basename "$skill")"
    case "$name" in
      engineering-core|engineering-orchestrator|devops-core|delivery-orchestrator)
        continue ;;
    esac
    if ! grep -q "$name" "$PLANS" && ! grep -q "$name" "$PHASES"; then
      fail "skill absent from every plan and phase: $category/$name"
    fi
  done
done

printf 'Check 8: declared dependencies exist, every tree\n'
for group in $ALL_GROUPS; do
  for skill in "$ROOT/$group"/*/; do
    [ -d "$skill" ] || continue
    name="$(basename "$skill")"
    deps="$(grep -m1 '^  depends_on:' "$skill/SKILL.md" \
      | sed 's/^  depends_on: *\[//; s/\]$//; s/,/ /g')"
    for dep in $deps; do
      [ -n "$dep" ] || continue
      skill_dir "$dep" >/dev/null || fail "$name: unknown depends_on, $dep"
    done
  done
done

printf 'Check 9: Interfaces cross references, every procedural tree\n'
for group in $PROCEDURAL_GROUPS; do
  for skill in "$ROOT/$group"/*/; do
    [ -d "$skill" ] || continue
    name="$(basename "$skill")"
    refs="$(awk '/^## [0-9]+\. Interfaces/ { on = 1; next }
                 on && /^## / { on = 0 }
                 on { print }' "$skill/SKILL.md" \
      | grep -o '`[a-z][a-z0-9-]*`' | tr -d '`' | sort -u)"
    for ref in $refs; do
      case "$ref" in
        dev-skills|delivery-skills|devops-skills) continue ;;
      esac
      skill_dir "$ref" >/dev/null \
        || fail "$name: unknown Interfaces reference, $ref"
    done
  done
done

printf 'Check 10: agent definitions\n'
for agent in $AGENT_NAMES; do
  file="$(agent_file "$agent")"
  if [ -z "$file" ]; then
    fail "missing agent: $agent"
    continue
  fi
  head -n 1 "$file" | grep -q '^---$' \
    || fail "$agent: metadata block missing"
  grep -q "^name: $agent$" "$file" \
    || fail "$agent: the name field does not match the file"
  desc="$(grep -m1 '^description:' "$file" | cut -c14-)"
  [ "${#desc}" -ge 40 ] \
    || fail "$agent: description too short to be discoverable"
  for section in Role Mission Responsibilities Inputs Outputs Boundaries \
                 Verification Handoff; do
    grep -q "^## $section" "$file" \
      || fail "$agent: section $section missing"
  done
  grep -q "$agent" "$AGENTS/README.md" \
    || fail "$agent: missing from agents/README.md"
done

# No orphan file, and no name declared twice across groups: installation is
# flat, and a collision would silently lose one agent to another.
AGENT_FILE_NAMES=""
for file in "$AGENTS"/*/*.md; do
  [ -f "$file" ] || continue
  name="$(basename "$file" .md)"
  case " $AGENT_FILE_NAMES " in
    *" $name "*) fail "duplicate agent name across groups: $name" ;;
  esac
  AGENT_FILE_NAMES="$AGENT_FILE_NAMES $name"
  printf '%s\n' $AGENT_NAMES | grep -qx "$name" \
    || fail "agent not declared in the expected list: $name"
done

printf 'Check 11: agents cite real skills\n'
for agent in $AGENT_NAMES; do
  file="$(agent_file "$agent")"
  [ -n "$file" ] || continue
  refs="$(awk '/^## Skills/ { on = 1; next }
               on && /^## / { on = 0 }
               on { print }' "$file" \
    | grep -o '`[a-z][a-z0-9-]*`' | tr -d '`' | sort -u)"
  for ref in $refs; do
    skill_dir "$ref" >/dev/null \
      || fail "$agent: unknown skill in the Skills section, $ref"
  done
done

printf 'Check 12: document pipeline coherence\n'
# document-core governs its tree, so every other skill in it declares the
# dependency rather than restating the constitution.
for skill in "$ROOT/documents"/*/*/; do
  [ -d "$skill" ] || continue
  # Only real skills carry a SKILL.md; examples and other material under the
  # tree (documents/examples/...) are not skills and are skipped.
  [ -f "$skill/SKILL.md" ] || continue
  name="$(basename "$skill")"
  [ "$name" = "document-core" ] && continue
  grep -q '^  depends_on:.*document-core' "$skill/SKILL.md" \
    || fail "$name: does not declare document-core as a dependency"
done
# The rendering skills sit at the end of the pipeline, after the writing ones.
for pair in "document-design:document-core" "pdf-production:document-design"; do
  child="${pair%%:*}"; parent="${pair##*:}"
  dir="$(skill_dir "$child")" || { fail "missing skill: $child"; continue; }
  grep -q "^  depends_on:.*$parent" "$dir/SKILL.md" \
    || fail "$child: does not declare $parent as a dependency"
done

printf 'Check 13: cross domain skills stay independent\n'
# shared/ is called by every tree, so it may not depend on any of them.
for skill in "$ROOT/shared"/*/; do
  [ -d "$skill" ] || continue
  name="$(basename "$skill")"
  deps="$(grep -m1 '^  depends_on:' "$skill/SKILL.md" \
    | sed 's/^  depends_on: *\[//; s/\]$//; s/,/ /g')"
  for dep in $deps; do
    [ -n "$dep" ] && fail "$name: a shared skill must not depend on $dep"
  done
done

printf '\n%s errors.\n' "$ERRORS"
[ "$ERRORS" -eq 0 ] || exit 1
printf 'Orchestration coherent.\n'
