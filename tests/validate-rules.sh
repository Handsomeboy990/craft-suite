#!/usr/bin/env bash
# Verifies the repository wide prohibitions on every Markdown file.
# Usage: bash tests/validate-rules.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0
WARNINGS=0

files() {
  # plugins/ holds generated copies of the trees, which are already checked at
  # their canonical location; sweeping the copies too is redundant, exactly as
  # dist/ is excluded. tests/validate-plugins.sh keeps the copies in sync.
  # node_modules/ belongs to whoever ran a reference implementation: it is other
  # people's code, it is never committed, and its prose is not ours to rule on.
  find "$ROOT" -type f -name '*.md' \
    -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/plugins/*' \
    -not -path '*/node_modules/*' | sort
}

report_error() {
  printf 'ERROR   %s\n' "$1"
  ERRORS=$((ERRORS + 1))
}

report_warning() {
  printf 'WARN    %s\n' "$1"
  WARNINGS=$((WARNINGS + 1))
}

printf 'Check 1: em dash\n'
while IFS= read -r file; do
  hits="$(grep -n $'—' "$file" 2>/dev/null | head -n 3)"
  if [ -n "$hits" ]; then
    report_error "em dash in ${file#"$ROOT"/}"
    printf '%s\n' "$hits" | sed 's/^/        /'
  fi
done < <(files)

printf 'Check 2: emoji and pictograms\n'
while IFS= read -r file; do
  hits="$(grep -nP '[\x{1F000}-\x{1FAFF}\x{2190}-\x{21FF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]' "$file" 2>/dev/null | head -n 3)"
  if [ -n "$hits" ]; then
    report_error "emoji or pictogram in ${file#"$ROOT"/}"
    printf '%s\n' "$hits" | sed 's/^/        /'
  fi
done < <(files)

printf 'Check 3: no credential shaped string anywhere\n'
while IFS= read -r file; do
  hits="$(grep -nE 'BEGIN [A-Z ]*PRIVATE KEY|sk_live_[A-Za-z0-9]{8}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10}|ghp_[A-Za-z0-9]{20}' \
    "$file" 2>/dev/null | head -n 2)"
  if [ -n "$hits" ]; then
    report_error "credential shaped string in ${file#"$ROOT"/}"
    printf '%s\n' "$hits" | sed 's/^/        /'
  fi
done < <(files)

printf 'Check 4: no personal identity hardcoded in a skill\n'
# Skills read the author identity from the configuration. An address that is
# not a reserved documentation domain means a real person was written into a
# reusable skill.
while IFS= read -r file; do
  case "$file" in
    */writing/examples/*) continue ;;
  esac
  # Reserved documentation domains are allowed: RFC 2606 and RFC 6761 name
  # example.com, example.org, example.net and the .test, .example, .invalid
  # and .localhost top level domains for exactly this purpose.
  hits="$(grep -nEo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "$file" 2>/dev/null \
    | grep -viE '@([A-Za-z0-9.-]+\.)?example\.(org|com|net)$|\.(test|example|invalid|localhost)$' \
    | head -n 2)"
  if [ -n "$hits" ]; then
    report_error "hardcoded email address in ${file#"$ROOT"/}"
    printf '%s\n' "$hits" | sed 's/^/        /'
  fi
done < <(find "$ROOT/writing" "$ROOT/documents" "$ROOT/engineering" "$ROOT/shared" \
  "$ROOT/security" "$ROOT/research" "$ROOT/career" "$ROOT/opportunity" \
  -type f -name '*.md' -not -path '*/node_modules/*' 2>/dev/null | sort)

# Prose lines only: outside fenced code blocks, where straight quotes are
# syntax rather than a typographic fault.
prose() {
  awk '
    {
      if (match($0, /^[[:space:]]*`+/)) {
        marker = substr($0, RSTART, RLENGTH)
        gsub(/[^`]/, "", marker)
        n = length(marker)
        if (n >= 3) {
          if (!fence) { fence = 1; opened = n; next }
          else if (n >= opened) { fence = 0; next }
        }
      }
      if (!fence) printf "%d:%s\n", NR, $0
    }
  ' "$1" 2>/dev/null
}

# French typography only. The rest of the repository is written in English,
# where the straight quote is correct rather than a defect.
printf 'Check 5: straight quotes in French prose\n'
while IFS= read -r file; do
  case "$file" in
    *"/examples/"*) continue ;;
  esac
  hits="$(prose "$file" | grep '"' | grep -v '`' | head -n 2)"
  if [ -n "$hits" ]; then
    report_warning "straight quotes in ${file#"$ROOT"/}"
    printf '%s\n' "$hits" | sed 's/^/        /'
  fi
done < <(find "$ROOT/writing" -type f -name '*.md' | sort)

printf 'Check 6: repeated exclamation marks\n'
while IFS= read -r file; do
  case "$file" in
    *"/examples/"*) continue ;;
  esac
  if grep -q '!!' "$file" 2>/dev/null; then
    report_warning "repeated exclamation marks in ${file#"$ROOT"/}"
  fi
done < <(files)

printf 'Check 7: no tracked local agent configuration or secret file\n'
# Rule 6 of AGENTS.md: a file named after an agent runtime is machine local
# configuration and is never versioned. The public entry point is AGENTS.md.
if command -v git >/dev/null 2>&1 &&
   git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  while IFS= read -r tracked; do
    [ -n "$tracked" ] || continue
    report_error "tracked file that must never be versioned: $tracked"
  done < <(git -C "$ROOT" ls-files \
    'CLAUDE.md' '**/CLAUDE.md' '.claude/**' '.claude.json' \
    '.cursorrules' '.cursor/**' '.windsurfrules' '.aider*' \
    '.env' '.env.*' '*.pem' '*.key' 'credentials.json' 2>/dev/null \
    | grep -v '\.env\.example$')
  git -C "$ROOT" ls-files --error-unmatch AGENTS.md >/dev/null 2>&1 \
    || report_error "AGENTS.md is missing from version control"
else
  report_warning "git unavailable, check 7 skipped"
fi

printf '\n%s errors, %s warnings.\n' "$ERRORS" "$WARNINGS"
[ "$ERRORS" -eq 0 ] || exit 1
printf 'Repository rules respected.\n'
