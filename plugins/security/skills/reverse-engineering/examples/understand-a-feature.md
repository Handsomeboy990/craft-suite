# Example: understand an owned app's feature, then build an original one

The requester owns a desktop app they shipped and wants to understand how its
offline search indexes documents, to reimplement it faster. They are entitled to
analyse their own artifact.

## Gate

Entitlement confirmed: it is their own build. No third-party licence forbids it.
Purpose is legitimate: reimplement their own feature.

## Analysis, local and contained

The app is an Electron bundle. A configured RE MCP registers it and reports the
module graph. The search module is read from the bundle's own unobfuscated
structure:

- `search/index.js` builds an inverted index on a worker thread (evidence: the
  module, the `Worker` import).
- tokenisation is trigram based (inference from the tokenizer function; marked
  an inference, confidence medium).
- the index is persisted to SQLite (evidence: the `better-sqlite3` import and
  the schema string).

## Limits stated

The ranking function is minified beyond confident recovery; reported as a blind
spot, not guessed. No native module was analysed because none is used here.

## Hand off

The understanding goes to the engineer, who writes an original trigram indexer.
No recovered source is copied into the new implementation. Had a vulnerability
surfaced (for example a path traversal in the persistence), it would have gone to
vulnerability-assessment and the fixer instead.
