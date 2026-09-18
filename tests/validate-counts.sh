#!/usr/bin/env bash
# Verifies that the counts written in the documentation match the real counts
# on disk, and fails on drift.
#
# The trees are the source of truth: this script counts SKILL.md files and
# agent definitions, then checks the places where those counts are written by
# hand against what it found. A number that fell behind, a per-tree total that
# no longer sums, an agent-group count left at an old value: all of that class
# of error is caught here instead of by a reader months later.
#
# What it checks: the structured count locations, the tree diagrams, the
# category tables, the installer menus and the totals. It does not try to parse
# every prose sentence, nor the plugin bundle sizes (which include cross-tree
# dependencies and are not a plain directory count); those stay the reader's
# job. What it does check, it checks exactly.
#
#   bash tests/validate-counts.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

fail() { printf 'ERROR   %s\n' "$1"; ERRORS=$((ERRORS + 1)); }

# --------------------------------------------------------------------------
# Canonical counts, from the filesystem.
# --------------------------------------------------------------------------

skills_in() { find "$ROOT/$1" -name SKILL.md 2>/dev/null | wc -l | tr -d ' '; }
agents_in() {
  ls "$ROOT/agents/$1"/*.md 2>/dev/null \
    | grep -vE '/(README|handoff-protocol)\.md$' | wc -l | tr -d ' '
}

WRITING=$(skills_in writing)
DOCUMENTS=$(skills_in documents)
SECURITY=$(skills_in security)
RESEARCH=$(skills_in research)
CAREER=$(skills_in career)
OPPORTUNITY=$(skills_in opportunity)
SHARED=$(skills_in shared)

DEV=$(skills_in engineering/dev-skills)
DELIV=$(skills_in engineering/delivery-skills)
DEVOPS=$(skills_in engineering/devops-skills)
ENG=$((DEV + DELIV + DEVOPS))

SECDEV=$(skills_in security/secure-development)
SECASSURE=$(skills_in security/security-assurance)

TOTAL=$(find "$ROOT" -name SKILL.md -not -path "*/plugins/*" | wc -l | tr -d ' ')

AG_CORE=$(agents_in core)
AG_DEV=$(agents_in development)
AG_DESIGN=$(agents_in design)
AG_SEC=$(agents_in security)
AG_TEST=$(agents_in testing)
AG_DOC=$(agents_in documentation)
AG_OPS=$(agents_in devops)
AGENTS=$(ls "$ROOT"/agents/*/*.md 2>/dev/null \
  | grep -vE '/(README|handoff-protocol)\.md$' | wc -l | tr -d ' ')

printf 'Real counts: %s skills total, %s agents total.\n' "$TOTAL" "$AGENTS"
printf '  trees: writing %s, documents %s, engineering %s, security %s, research %s, career %s, opportunity %s, shared %s\n' \
  "$WRITING" "$DOCUMENTS" "$ENG" "$SECURITY" "$RESEARCH" "$CAREER" "$OPPORTUNITY" "$SHARED"
printf '  engineering: dev-skills %s, delivery-skills %s, devops-skills %s\n' "$DEV" "$DELIV" "$DEVOPS"
printf '  agents: core %s, development %s, design %s, security %s, testing %s, documentation %s, devops %s\n\n' \
  "$AG_CORE" "$AG_DEV" "$AG_DESIGN" "$AG_SEC" "$AG_TEST" "$AG_DOC" "$AG_OPS"

# The engineering total must be the sum of its categories, or the docs cannot
# be right no matter what they say.
[ "$ENG" -eq "$((DEV + DELIV + DEVOPS))" ] \
  || fail "engineering total $ENG does not equal dev+delivery+devops"

# --------------------------------------------------------------------------
# check <file> <expected> <line-selector-ERE> <label> [extractor-PCRE]
#
# Selects every line matching the ERE, extracts a number from each (the first
# integer by default, or the PCRE match when given), and fails on any number
# that is not <expected>, or when the selector matches nothing at all (which
# means the counted phrase was reworded and this check needs updating).
# --------------------------------------------------------------------------
check() {
  local rel="$1" expected="$2" sel="$3" label="$4" ext="${5:-[0-9]+}"
  local file="$ROOT/$rel" matches lineno text num
  [ -f "$file" ] || { fail "$rel: file missing ($label)"; return; }
  matches="$(grep -nE "$sel" "$file" 2>/dev/null)"
  if [ -z "$matches" ]; then
    fail "$rel: no line matched for '$label' (selector reworded? update the check)"
    return
  fi
  while IFS= read -r ml; do
    [ -n "$ml" ] || continue
    lineno="${ml%%:*}"; text="${ml#*:}"
    num="$(printf '%s' "$text" | grep -oP "$ext" | head -1)"
    if [ -z "$num" ]; then
      fail "$rel:$lineno: no number found for '$label'"
    elif [ "$num" != "$expected" ]; then
      fail "$rel:$lineno: '$label' is $num, expected $expected  ->$text"
    fi
  done <<< "$matches"
}

# --------------------------------------------------------------------------
# Totals.
# --------------------------------------------------------------------------
check README.md          "$TOTAL"  '[0-9]+ skills and [0-9]+ agents'  "README total skills"
check README.md          "$AGENTS" 'skills and [0-9]+ agents'         "README total agents"  '(?<=and )[0-9]+(?= agents)'
check README.fr.md       "$TOTAL"  '[0-9]+ skills et [0-9]+ agents'   "README.fr total skills"
check README.fr.md       "$AGENTS" 'skills et [0-9]+ agents'          "README.fr total agents" '(?<=et )[0-9]+(?= agents)'
check AGENTS.md          "$TOTAL"  '[0-9]+ skills and [0-9]+ agents'  "AGENTS total skills"
check AGENTS.md          "$AGENTS" 'skills and [0-9]+ agents'         "AGENTS total agents"  '(?<=and )[0-9]+(?= agents)'

# --------------------------------------------------------------------------
# overview.md and overview.fr.md: the ASCII tree diagram.
# --------------------------------------------------------------------------
for f in documentation/overview.md documentation/overview.fr.md; do
  check "$f" "$SHARED"      'shared/ +[0-9]'      "$f shared diagram"
  check "$f" "$WRITING"     'writing/ +[0-9]'     "$f writing diagram"
  check "$f" "$DOCUMENTS"   'documents/ +[0-9]'   "$f documents diagram"
  check "$f" "$ENG"         'engineering/ +[0-9]' "$f engineering diagram"
  check "$f" "$AGENTS"      'agents/ +[0-9]'      "$f agents diagram"
  check "$f" "$SECURITY"    'security/ +[0-9]'    "$f security diagram"
  check "$f" "$RESEARCH"    'research/ +[0-9]'    "$f research diagram"
  check "$f" "$CAREER"      'career/ +[0-9]'      "$f career diagram"
  check "$f" "$OPPORTUNITY" 'opportunity/ +[0-9]' "$f opportunity diagram"
done

# --------------------------------------------------------------------------
# Category tables: | name | N | ... . Present in overview (two tables),
# overview.fr, installation and engineering/README.
# --------------------------------------------------------------------------
for f in documentation/overview.md documentation/overview.fr.md documentation/installation.md; do
  check "$f" "$DEV"       'dev-skills.*\| [0-9]+ \|'         "$f dev-skills row"
  check "$f" "$DELIV"     'delivery-skills.*\| [0-9]+ \|'    "$f delivery-skills row"
  check "$f" "$DEVOPS"    'devops-skills.*\| [0-9]+ \|'      "$f devops-skills row"
done
for f in documentation/overview.md documentation/overview.fr.md documentation/installation.md; do
  check "$f" "$SECDEV"    'secure-development.*\| [0-9]+ \|' "$f secure-development row"
  check "$f" "$SECASSURE" 'security-assurance.*\| [0-9]+ \|'  "$f security-assurance row"
done

check engineering/README.md "$DEV"    'dev-skills.*\| [0-9]+ \|'      "engineering/README dev-skills row"
check engineering/README.md "$DELIV"  'delivery-skills.*\| [0-9]+ \|' "engineering/README delivery-skills row"
check engineering/README.md "$DEVOPS" 'devops-skills.*\| [0-9]+ \|'   "engineering/README devops-skills row"
check engineering/README.md "$ENG"    '[0-9]+ skills in three categories' "engineering/README engineering total"
check engineering/README.md "$AGENTS" 'specialised agents'            "engineering/README agent total"

# --------------------------------------------------------------------------
# architecture.md: the ASCII tree diagram. It carries both a skills diagram and
# an agent-group diagram, so tokens like `core/`, `security/`, `documentation/`
# and `development/` appear twice with different meanings. Only the unambiguous
# tokens are checked here; the security tree line is disambiguated from the
# agents/security group by requiring the " skills" suffix the tree line carries.
# The per-group agent counts live only in this colliding diagram and are left
# out; the agents total is checked, and it is unambiguous.
# --------------------------------------------------------------------------
A=documentation/architecture.md
check "$A" "$ENG"       'engineering/ +[0-9]'          "architecture engineering"
check "$A" "$DEV"       'dev-skills/ +[0-9]'           "architecture dev-skills"
check "$A" "$DELIV"     'delivery-skills/ +[0-9]'      "architecture delivery-skills"
check "$A" "$DEVOPS"    'devops-skills/ +[0-9]'        "architecture devops-skills"
check "$A" "$SECURITY"  'security/ +[0-9]+ skills'     "architecture security tree"
check "$A" "$SECDEV"    'secure-development/ +[0-9]'   "architecture secure-development"
check "$A" "$SECASSURE" 'security-assurance/ +[0-9]'   "architecture security-assurance"
check "$A" "$AGENTS"    'agents/ +[0-9]'               "architecture agents total"

# --------------------------------------------------------------------------
# Installer menus (present in installation.md and overview.md / overview.fr.md).
# --------------------------------------------------------------------------
# The menu lines begin with a list number (1), 2), ...), so the count is the
# integer immediately before " skills", not the first integer on the line.
MENU='[0-9]+(?= skills)'
for f in documentation/installation.md documentation/overview.md documentation/overview.fr.md; do
  check "$f" "$WRITING"     'Creative writing +[0-9]+ skills'       "$f menu writing"       "$MENU"
  check "$f" "$DOCUMENTS"   'Professional documents +[0-9]+ skills' "$f menu documents"     "$MENU"
  check "$f" "$ENG"         'Software engineering +[0-9]+ skills'   "$f menu engineering"   "$MENU"
  check "$f" "$SECURITY"    'Cybersecurity +[0-9]+ skills'          "$f menu security"      "$MENU"
  check "$f" "$RESEARCH"    'Research +[0-9]+ skills'               "$f menu research"      "$MENU"
  check "$f" "$CAREER"      'Career +[0-9]+ skills'                 "$f menu career"        "$MENU"
  check "$f" "$OPPORTUNITY" 'Opportunity +[0-9]+ skills'            "$f menu opportunity"   "$MENU"
  check "$f" "$TOTAL"       'Everything +[0-9]+ skills'             "$f menu everything"    "$MENU"
done

printf '\n%s errors.\n' "$ERRORS"
[ "$ERRORS" -eq 0 ] || exit 1
printf 'Counts consistent.\n'
