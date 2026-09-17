#!/usr/bin/env bash
# Verifies the model-routing skill's fixtures against its own tier table, with
# no live model call. A fixture that does not match the table is a defect in
# one of the two, caught here rather than discovered mid task.
# Usage: bash tests/validate-model-routing.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$ROOT/engineering/dev-skills/model-routing"
TABLE="$SKILL/resources/tier-table.json"
FIXTURES="$SKILL/resources/fixtures.json"

command -v python3 >/dev/null || {
  printf 'ERROR   python3 not found, cannot validate routing fixtures\n' >&2
  exit 1
}

python3 - "$TABLE" "$FIXTURES" <<'PY'
import json
import sys

table_path, fixtures_path = sys.argv[1], sys.argv[2]
errors = []

with open(table_path, encoding="utf-8") as f:
    table = json.load(f)
with open(fixtures_path, encoding="utf-8") as f:
    fixtures = json.load(f)

routing = table["routing"]
overrides = {o["id"]: o for o in table["override_conditions"]}
complexity_tiers = set(table["complexity_tiers"])
model_tiers = set(table["model_tiers"])
effort_levels = set(table["effort_levels"])

print("Check 1: base tier fixtures match the routing table")
for fx in fixtures["base_tier_fixtures"]:
    entry = routing.get(fx["complexity"])
    if entry is None:
        errors.append(f"{fx['id']}: unknown complexity tier {fx['complexity']}")
        continue
    if entry["model_tier"] != fx["expected_model_tier"]:
        errors.append(
            f"{fx['id']}: expected model tier {fx['expected_model_tier']}, "
            f"table says {entry['model_tier']}"
        )
    if entry["effort"] != fx["expected_effort"]:
        errors.append(
            f"{fx['id']}: expected effort {fx['expected_effort']}, "
            f"table says {entry['effort']}"
        )

print("Check 2: override fixtures reference a real override condition")
for fx in fixtures["override_fixtures"]:
    if fx["override"] not in overrides:
        errors.append(f"{fx['id']}: unknown override condition {fx['override']}")
    if fx["expected_model_tier"] not in model_tiers:
        errors.append(f"{fx['id']}: unknown model tier {fx['expected_model_tier']}")
    if fx["expected_effort"] not in effort_levels:
        errors.append(f"{fx['id']}: unknown effort level {fx['expected_effort']}")

print("Check 3: transition fixtures carry a reason and an actual tier change")
for fx in fixtures["transition_fixtures"]:
    prior, new = fx["prior"], fx["new"]
    for side, label in ((prior, "prior"), (new, "new")):
        if side["complexity"] not in complexity_tiers:
            errors.append(f"{fx['id']}: unknown {label} complexity {side['complexity']}")
        if side["model_tier"] not in model_tiers:
            errors.append(f"{fx['id']}: unknown {label} model tier {side['model_tier']}")
        if side["effort"] not in effort_levels:
            errors.append(f"{fx['id']}: unknown {label} effort {side['effort']}")
    if prior == new:
        errors.append(f"{fx['id']}: prior and new are identical, not a transition")
    if not fx.get("reason", "").strip():
        errors.append(f"{fx['id']}: transition has no stated reason")
    if fx.get("direction") not in ("escalation", "de-escalation"):
        errors.append(f"{fx['id']}: direction must be escalation or de-escalation")
    order = ["TRIVIAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
    rank_prior, rank_new = order.index(prior["complexity"]), order.index(new["complexity"])
    if fx.get("direction") == "escalation" and rank_new <= rank_prior:
        errors.append(f"{fx['id']}: marked escalation but complexity did not increase")
    if fx.get("direction") == "de-escalation" and rank_new >= rank_prior:
        errors.append(f"{fx['id']}: marked de-escalation but complexity did not decrease")

if errors:
    for e in errors:
        print(f"ERROR   {e}")
    print(f"\n{len(errors)} errors.")
    sys.exit(1)

total = (
    len(fixtures["base_tier_fixtures"])
    + len(fixtures["override_fixtures"])
    + len(fixtures["transition_fixtures"])
)
print(f"\n{total} fixtures checked, 0 errors.")
print("Model routing fixtures coherent.")
PY
