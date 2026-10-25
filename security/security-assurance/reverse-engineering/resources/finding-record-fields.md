# Reverse-engineering finding record

Every conclusion carries all of these, or it is not recorded.

- claim: what the artifact does
- artifact reference: address, symbol, module or call another analyst can reach
- basis: observed (read directly) | inferred (reasoned, marked) 
- confidence: and what would raise it
- limit: what was obfuscated, stripped, packed or not reached near this claim

Pass-level limits, stated once:

- [ ] entitlement and licence/terms checked before analysis
- [ ] analysis kept local and contained; artifact never run with real data
- [ ] configured RE tool driven, or its absence recorded with what it would add
- [ ] blind spots listed: obfuscation, stripping, packing, unreached paths
- [ ] no recovered source copied into any build
