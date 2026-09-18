#!/usr/bin/env bash
# Verifies the mandatory structure of every skill in the suite.
# Usage: bash tests/validate-structure.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# A skill group is a repository relative path holding skill directories. The
# category recorded in a skill's metadata is the basename of its group.
WRITING_GROUPS="writing/core writing/genres writing/poetry writing/quality"
DOCUMENT_GROUPS="documents/documentation documents/administrative documents/publishing"
ENGINEERING_GROUPS="engineering/dev-skills engineering/delivery-skills engineering/devops-skills"
SECURITY_GROUPS="security/secure-development security/security-assurance"
RESEARCH_GROUPS="research"
CAREER_GROUPS="career"
OPPORTUNITY_GROUPS="opportunity/ideation opportunity/hackathons opportunity/business"
SHARED_GROUPS="shared"
ALL_GROUPS="$WRITING_GROUPS $DOCUMENT_GROUPS $ENGINEERING_GROUPS $SECURITY_GROUPS $RESEARCH_GROUPS $CAREER_GROUPS $OPPORTUNITY_GROUPS $SHARED_GROUPS"

# Groups whose skills must carry a numbered Protocol section and an Interfaces
# section. These are the English, procedural trees. The writing tree names its
# procedure in ways inherited from its own domain.
PROCEDURAL_GROUPS="$DOCUMENT_GROUPS $ENGINEERING_GROUPS $SECURITY_GROUPS $RESEARCH_GROUPS $CAREER_GROUPS $OPPORTUNITY_GROUPS $SHARED_GROUPS"

ERRORS=0
SKILLS=0
NAMES=""

fail() {
  printf 'ERROR   %s\n' "$1"
  ERRORS=$((ERRORS + 1))
}

# Uses its own loop variable: the caller iterates over $group and a shared
# name here would silently rewrite the outer loop.
is_procedural() {
  for candidate in $PROCEDURAL_GROUPS; do
    [ "$candidate" = "$1" ] && return 0
  done
  return 1
}

for group in $ALL_GROUPS; do
  category="$(basename "$group")"
  if [ ! -d "$ROOT/$group" ]; then
    fail "missing group: $group"
    continue
  fi
  for skill in "$ROOT/$group"/*/; do
    [ -d "$skill" ] || continue
    name="$(basename "$skill")"
    SKILLS=$((SKILLS + 1))

    # A flat installation target means two skills may never share a name.
    case " $NAMES " in
      *" $name "*) fail "$group/$name: duplicate skill name, would collide on install" ;;
    esac
    NAMES="$NAMES $name"

    [ -f "$skill/SKILL.md" ]  || fail "$group/$name: SKILL.md missing"
    [ -f "$skill/README.md" ] || fail "$group/$name: README.md missing"
    [ -d "$skill/examples" ]  || fail "$group/$name: examples directory missing"
    [ -d "$skill/resources" ] || fail "$group/$name: resources directory missing"

    if [ -d "$skill/examples" ] && [ -z "$(ls -A "$skill/examples" 2>/dev/null)" ]; then
      fail "$group/$name: examples is empty"
    fi
    if [ -d "$skill/resources" ] && [ -z "$(ls -A "$skill/resources" 2>/dev/null)" ]; then
      fail "$group/$name: resources is empty"
    fi

    if [ -f "$skill/SKILL.md" ]; then
      head -n 1 "$skill/SKILL.md" | grep -q '^---$' \
        || fail "$group/$name: metadata block missing"
      for key in name description license metadata; do
        grep -q "^$key:" "$skill/SKILL.md" \
          || fail "$group/$name: missing metadata key ($key)"
      done
      for key in category version depends_on outputs; do
        grep -q "^  $key:" "$skill/SKILL.md" \
          || fail "$group/$name: missing metadata subkey ($key)"
      done
      grep -q "^name: $name$" "$skill/SKILL.md" \
        || fail "$group/$name: the name field does not match the directory"
      grep -q "^  category: $category$" "$skill/SKILL.md" \
        || fail "$group/$name: the category field does not match the group"
      desc="$(grep -m1 '^description:' "$skill/SKILL.md" | cut -c14-)"
      [ "${#desc}" -ge 40 ] \
        || fail "$group/$name: description too short to be discoverable"
      grep -qi '^## .*[Aa]uto-critique' "$skill/SKILL.md" \
        || fail "$group/$name: Auto-critique section missing"

      if is_procedural "$group"; then
        grep -qE '^## [0-9]+\. Protocol' "$skill/SKILL.md" \
          || fail "$group/$name: numbered Protocol section missing"
        grep -qE '^## [0-9]+\. Interfaces' "$skill/SKILL.md" \
          || fail "$group/$name: Interfaces section missing"
      fi
    fi

    if [ -f "$skill/README.md" ]; then
      head -n 1 "$skill/README.md" | grep -q "^# $name$" \
        || fail "$group/$name: the README title does not match the directory"
    fi
  done
done

for f in README.md README.fr.md AGENTS.md CONTRIBUTING.md CHANGELOG.md LICENSE install.sh; do
  [ -f "$ROOT/$f" ] || fail "missing root file: $f"
done
for d in writing documents engineering shared documentation tests config \
         security research career opportunity \
         writing/resources writing/examples agents \
         agents/core agents/development agents/design agents/security \
         agents/testing agents/documentation agents/devops; do
  [ -d "$ROOT/$d" ] || fail "missing expected directory: $d"
done
for f in writing/README.md documents/README.md engineering/README.md \
         shared/README.md config/README.md \
         security/README.md research/README.md career/README.md \
         opportunity/README.md \
         config/craft.config.example.yaml; do
  [ -f "$ROOT/$f" ] || fail "missing index or template: $f"
done
for group in $ALL_GROUPS; do
  case "$group" in
    shared) continue ;;   # the tree index doubles as the group index
  esac
  [ -f "$ROOT/$group/README.md" ] || fail "missing group index: $group/README.md"
done
for f in architecture.md skills-guide.md writing-rules.md workflow.md \
         engineering-system.md delivery-system.md documents-system.md \
         installation.md configuration.md agents.md branch-protection.md \
         usage.md usage.fr.md; do
  [ -f "$ROOT/documentation/$f" ] || fail "missing documentation: $f"
done

# Every skill must be named in the index of its own category. This is the one
# check that would have caught `rate-limiting`: it was delivered, routed by
# skills-guide.md and listed by security/README.md, and invisible in the index
# of the category that holds it. The check is deliberately format agnostic,
# since some indexes link the directory and others only name it in a table.
for group in $ALL_GROUPS; do
  index="$ROOT/$group/README.md"
  [ -f "$index" ] || continue
  for skill in "$ROOT/$group"/*/; do
    [ -f "$skill/SKILL.md" ] || continue
    name="$(basename "${skill%/}")"
    grep -qF "$name" "$index" \
      || fail "$name is not listed in its category index: $group/README.md"
  done
done
for f in .github/CODEOWNERS .github/pull_request_template.md \
         .github/workflows/validate.yml .githooks/pre-push; do
  [ -f "$ROOT/$f" ] || fail "missing governance file: $f"
done

printf '\n%s skills checked, %s errors.\n' "$SKILLS" "$ERRORS"
[ "$ERRORS" -eq 0 ] || exit 1
printf 'Structure valid.\n'
