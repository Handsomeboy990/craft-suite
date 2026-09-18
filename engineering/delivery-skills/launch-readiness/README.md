# launch-readiness

The completeness gate for a user-facing web product before it is announced.
Not whether the code is safe to ship (`release-readiness`) or whether the
deployment runs (`production-verification`), but whether the product a user
meets is whole: legal pages, discoverability, content, performance,
accessibility, UX integrity, analytics, the full security posture, and the
infrastructure a real launch needs.

- Inputs: the built or deployed product, and what it is (static or dynamic,
  accounts, forms, cookies, personal data, database).
- Outputs: a status per checklist item with evidence, the launch blockers,
  the unverified gaps, and a single verdict.
- Depends on: engineering-core, implementation-integrity.
- Run by: the compliance-verifier agent, and delivery-orchestrator at phase 11.

The skill owns no depth. Where a skill already covers an item, this gate
delegates to it and records the result; what it adds is the web-launch items
that fall between the engineering skills (favicon, social preview, custom 404,
cookie banner, broken-link crawl, single call to action, legal page scaffold)
and the discipline that no item is marked done without evidence.

It never writes the legal text of a privacy policy or terms document. It
scaffolds the page, its required clauses and its links, and verifies the page
exists and is reachable. The wording carries legal liability and is the
owner's, or a lawyer's.

The full itemised checklist is in `resources/launch-checklist.md`, and the
concrete mapping for a Supabase and Next.js project is in
`resources/supabase-next-appendix.md`.
