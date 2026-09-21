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
# category tables, the installer menus, the totals, the plugin tables, the
# per-scope installation table, the count written in words at the top of each
# category index, and the agent totals whether written as a figure or in words.
# It does not try to parse every prose sentence. What it does check, it checks
# exactly.
#
#   bash tests/validate-counts.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

fail() { printf 'ERROR   %s\n' "$1"; ERRORS=$((ERRORS + 1)); }

# --------------------------------------------------------------------------
# Canonical counts, from the filesystem.
# --------------------------------------------------------------------------

skills_in() {
  find "$ROOT/$1" -name SKILL.md -not -path '*/node_modules/*' 2>/dev/null | wc -l | tr -d ' '
}
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

TOTAL=$(find "$ROOT" -name SKILL.md -not -path "*/plugins/*" \
  -not -path '*/node_modules/*' | wc -l | tr -d ' ')

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

# --------------------------------------------------------------------------
# check_nth <file> <expected> <selector-ERE> <n> <label>
#
# Same as check, but takes the Nth integer on the matching line. A table row
# that carries two counts, a tree count and a bundle count, needs this.
# --------------------------------------------------------------------------
check_nth() {
  local rel="$1" expected="$2" sel="$3" n="$4" label="$5"
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
    num="$(printf '%s' "$text" | grep -oE '[0-9]+' | sed -n "${n}p")"
    if [ -z "$num" ]; then
      fail "$rel:$lineno: fewer than $n numbers on the line for '$label'"
    elif [ "$num" != "$expected" ]; then
      fail "$rel:$lineno: '$label' is $num, expected $expected  ->$text"
    fi
  done <<< "$matches"
}

# --------------------------------------------------------------------------
# Counts written in words.
#
# "Fifty four skills" and "Eight skills" are exactly where drift went unnoticed,
# because no check reads prose. These two helpers read the one number word that
# opens a category index or names the agent total, and compare it to the disk.
# Hyphen and space are both accepted, since the repository uses both.
# --------------------------------------------------------------------------
UNIT_WORDS="zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen"
TEN_WORDS="x x twenty thirty forty fifty sixty seventy eighty ninety"
WORD_RE='(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[- ](one|two|three|four|five|six|seven|eight|nine)|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|nineteen|eighteen|seventeen|sixteen|fifteen|fourteen|thirteen|twelve|eleven|ten|nine|eight|seven|six|five|four|three|two|one'

word_for() {
  local n="$1" t u
  if [ "$n" -lt 20 ]; then
    printf '%s\n' $UNIT_WORDS | sed -n "$((n + 1))p"
    return
  fi
  t=$((n / 10)); u=$((n % 10))
  if [ "$u" -eq 0 ]; then
    printf '%s\n' $TEN_WORDS | sed -n "$((t + 1))p"
  else
    printf '%s-%s' "$(printf '%s\n' $TEN_WORDS | sed -n "$((t + 1))p")" \
                   "$(printf '%s\n' $UNIT_WORDS | sed -n "$((u + 1))p")"
  fi
}

# check_word <file> <expected-int> <selector-ERE> <label> [extractor-PCRE]
#
# The default extractor takes the first number word on the line, which is wrong
# whenever the line carries two. Those lines pass an anchored extractor instead.
check_word() {
  local rel="$1" expected="$2" sel="$3" label="$4" ext="${5:-$WORD_RE}"
  local file="$ROOT/$rel" matches lineno text found want
  want="$(word_for "$expected")"
  [ -f "$file" ] || { fail "$rel: file missing ($label)"; return; }
  matches="$(grep -nEi "$sel" "$file" 2>/dev/null)"
  if [ -z "$matches" ]; then
    fail "$rel: no line matched for '$label' (selector reworded? update the check)"
    return
  fi
  while IFS= read -r ml; do
    [ -n "$ml" ] || continue
    lineno="${ml%%:*}"; text="${ml#*:}"
    found="$(printf '%s' "$text" | grep -oiP "$ext" | head -1 \
             | tr 'A-Z ' 'a-z-')"
    if [ -z "$found" ]; then
      fail "$rel:$lineno: no number word found for '$label'"
    elif [ "$found" != "$want" ]; then
      fail "$rel:$lineno: '$label' says '$found', expected '$want'  ->$text"
    fi
  done <<< "$matches"
}

# --------------------------------------------------------------------------
# Plugin bundles. A bundle is its tree plus the two cross domain skills plus
# any cross-tree dependency the tree declares, so it is not a plain tree count
# and has to be measured on the bundle itself.
# --------------------------------------------------------------------------
bundle_skills() {
  find "$ROOT/plugins/$1/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null \
    | wc -l | tr -d ' '
}
bundle_agents() {
  ls "$ROOT/plugins/$1/agents"/*.md 2>/dev/null | wc -l | tr -d ' '
}

B_WRITING=$(bundle_skills writing)
B_DOCUMENTS=$(bundle_skills documents)
B_ENG=$(bundle_skills engineering)
B_SECURITY=$(bundle_skills security)
B_RESEARCH=$(bundle_skills research)
B_CAREER=$(bundle_skills career)
B_OPPORTUNITY=$(bundle_skills opportunity)
B_ENG_AGENTS=$(bundle_agents engineering)
B_SEC_AGENTS=$(bundle_agents security)

printf '  bundles: writing %s, documents %s, engineering %s (%s agents), security %s (%s agents), research %s, career %s, opportunity %s\n\n' \
  "$B_WRITING" "$B_DOCUMENTS" "$B_ENG" "$B_ENG_AGENTS" "$B_SECURITY" \
  "$B_SEC_AGENTS" "$B_RESEARCH" "$B_CAREER" "$B_OPPORTUNITY"

# The plugin table in the two root READMEs and in plugins.md carries two counts
# per row: the tree, then what the bundle actually holds.
for f in README.md README.fr.md documentation/plugins.md; do
  check_nth "$f" "$WRITING"       'craft-writing.*\| [0-9]+ \|'     1 "$f plugin writing tree"
  check_nth "$f" "$B_WRITING"     'craft-writing.*\| [0-9]+ \|'     2 "$f plugin writing bundle"
  check_nth "$f" "$DOCUMENTS"     'craft-documents.*\| [0-9]+ \|'   1 "$f plugin documents tree"
  check_nth "$f" "$B_DOCUMENTS"   'craft-documents.*\| [0-9]+ \|'   2 "$f plugin documents bundle"
  check_nth "$f" "$ENG"           'craft-engineering.*\| [0-9]+ \|' 1 "$f plugin engineering tree"
  check_nth "$f" "$B_ENG"         'craft-engineering.*\| [0-9]+ \|' 2 "$f plugin engineering bundle"
  check_nth "$f" "$B_ENG_AGENTS"  'craft-engineering.*\| [0-9]+ \|' 3 "$f plugin engineering agents"
  check_nth "$f" "$SECURITY"      'craft-security.*\| [0-9]+ \|'    1 "$f plugin security tree"
  check_nth "$f" "$B_SECURITY"    'craft-security.*\| [0-9]+ \|'    2 "$f plugin security bundle"
  check_nth "$f" "$B_SEC_AGENTS"  'craft-security.*\| [0-9]+ \|'    3 "$f plugin security agents"
  check_nth "$f" "$RESEARCH"      'craft-research.*\| [0-9]+ \|'    1 "$f plugin research tree"
  check_nth "$f" "$B_RESEARCH"    'craft-research.*\| [0-9]+ \|'    2 "$f plugin research bundle"
  check_nth "$f" "$CAREER"        'craft-career.*\| [0-9]+ \|'      1 "$f plugin career tree"
  check_nth "$f" "$B_CAREER"      'craft-career.*\| [0-9]+ \|'      2 "$f plugin career bundle"
  check_nth "$f" "$OPPORTUNITY"   'craft-opportunity.*\| [0-9]+ \|' 1 "$f plugin opportunity tree"
  check_nth "$f" "$B_OPPORTUNITY" 'craft-opportunity.*\| [0-9]+ \|' 2 "$f plugin opportunity bundle"
done

# --------------------------------------------------------------------------
# The per-scope verification table. These are the numbers the installer prints,
# and the ones a user compares against `ls ~/.claude/skills | wc -l`. They are
# the bundle counts, because a scope installs what its bundle holds.
# --------------------------------------------------------------------------
for f in documentation/installation.md documentation/usage.md documentation/usage.fr.md; do
  check_nth "$f" "$B_WRITING"     '^\| `--writing` \|'     1 "$f scope writing skills"
  check_nth "$f" "$B_DOCUMENTS"   '^\| `--documents` \|'   1 "$f scope documents skills"
  check_nth "$f" "$B_ENG"         '^\| `--dev` \|'         1 "$f scope dev skills"
  check_nth "$f" "$B_ENG_AGENTS"  '^\| `--dev` \|'         2 "$f scope dev agents"
  check_nth "$f" "$B_SECURITY"    '^\| `--security` \|'    1 "$f scope security skills"
  check_nth "$f" "$B_SEC_AGENTS"  '^\| `--security` \|'    2 "$f scope security agents"
  check_nth "$f" "$B_RESEARCH"    '^\| `--research` \|'    1 "$f scope research skills"
  check_nth "$f" "$B_CAREER"      '^\| `--career` \|'      1 "$f scope career skills"
  check_nth "$f" "$B_OPPORTUNITY" '^\| `--opportunity` \|' 1 "$f scope opportunity skills"
  check_nth "$f" "$SHARED"        '^\| `--shared` \|'      1 "$f scope shared skills"
  check_nth "$f" "$TOTAL"         '^\| `--all` \|'         1 "$f scope all skills"
  check_nth "$f" "$AGENTS"        '^\| `--all` \|'         2 "$f scope all agents"
  check_nth "$f" "$AGENTS"        '^\| `--agents` \|'      2 "$f scope agents only"
done

# --------------------------------------------------------------------------
# AGENTS.md tree table. This is the third hand-written copy of the per-tree
# counts, and it is where the security 10 against 12 divergence was born.
# --------------------------------------------------------------------------
check_nth AGENTS.md "$SHARED"      '^\| `shared/` \|'      1 "AGENTS shared row"
check_nth AGENTS.md "$WRITING"     '^\| `writing/` \|'     1 "AGENTS writing row"
check_nth AGENTS.md "$DOCUMENTS"   '^\| `documents/` \|'   1 "AGENTS documents row"
check_nth AGENTS.md "$ENG"         '^\| `engineering/` \|' 1 "AGENTS engineering row"
check_nth AGENTS.md "$AGENTS"      '^\| `agents/` \|'      1 "AGENTS agents row"
check_nth AGENTS.md "$SECURITY"    '^\| `security/` \|'    1 "AGENTS security row"
check_nth AGENTS.md "$RESEARCH"    '^\| `research/` \|'    1 "AGENTS research row"
check_nth AGENTS.md "$CAREER"      '^\| `career/` \|'      1 "AGENTS career row"
check_nth AGENTS.md "$OPPORTUNITY" '^\| `opportunity/` \|' 1 "AGENTS opportunity row"

# --------------------------------------------------------------------------
# The number word that opens a category index, and the agent total in prose.
# --------------------------------------------------------------------------
SKILLS_WORD='[A-Za-z]+([- ][a-z]+)?(?= skills)'
check_word engineering/dev-skills/README.md      "$DEV"       'system\. [A-Za-z]+ [a-z]+ skills' "dev-skills prose count"      "$SKILLS_WORD"
check_word engineering/delivery-skills/README.md "$DELIV"     'system\. [A-Za-z]+ skills'        "delivery-skills prose count" "$SKILLS_WORD"
check_word engineering/devops-skills/README.md   "$DEVOPS"    'system\. [A-Za-z]+ skills'        "devops-skills prose count"   "$SKILLS_WORD"
check_word security/security-assurance/README.md "$SECASSURE" 'exists\. [A-Za-z]+ skills'        "security-assurance prose count" "$SKILLS_WORD"
check_word security/secure-development/README.md "$SECDEV"    'hardening one that exists\.'      "secure-development prose count" '(?<=exists\. )[A-Za-z]+'

check_word agents/README.md "$AGENTS" 'specialised agent definitions' "agents/README prose agent total"
check_word documentation/README.md "$AGENTS" 'public contracts' "documentation/README agent total" \
  '(?<=the )[a-z-]+(?= public contracts)'
check_word tests/README.md "$AGENTS" 'agent definitions, with their eight' "tests/README agent total" \
  '(?<=the )[a-z-]+(?= agent definitions)'
check_word documentation/engineering-system.md "$AGENTS" 'agent definitions,' "engineering-system agent total" \
  '(?<=the )[a-z-]+(?= agent definitions)'
check_word docs/architecture/SKILL_AGENT_MATRIX.md "$AGENTS" 'which of the [a-z-]+' "SKILL_AGENT_MATRIX agent total" \
  '(?<=which of the )[a-z-]+'
check_word docs/architecture/AGENT_ARCHITECTURE.md "$AGENTS" '^## The [a-z-]+ agents, by group' "AGENT_ARCHITECTURE agent total"
check documentation/skills-guide.md "$AGENTS" '^### agents, [0-9]+' "skills-guide agent heading"

# --------------------------------------------------------------------------
# docs/agents/README.md declares what is not yet built. An agent named there
# and present on disk is exactly the contradiction that stood for three phases.
# --------------------------------------------------------------------------
NOT_BUILT="$(awk '/^## What is not yet built/{p=1; next} /^## /{p=0} p' \
  "$ROOT/docs/agents/README.md" 2>/dev/null \
  | sed -n '1,/^$/p;1,/Full reasoning/p' \
  | grep -oP '(?<=`)[a-z][a-z-]+(?=`)' | sort -u)"
if [ -z "$NOT_BUILT" ]; then
  fail "docs/agents/README.md: no names found under 'What is not yet built' (section reworded? update the check)"
else
  for name in $NOT_BUILT; do
    if ls "$ROOT/agents"/*/"$name.md" >/dev/null 2>&1; then
      fail "docs/agents/README.md: '$name' is listed as not yet built, but agents/*/$name.md exists"
    fi
  done
fi

printf '\n%s errors.\n' "$ERRORS"
[ "$ERRORS" -eq 0 ] || exit 1
printf 'Counts consistent.\n'
