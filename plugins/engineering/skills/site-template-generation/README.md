# site-template-generation

Builds a client website as a fixed template driven by an external content file,
so the site can still be changed a year later without a developer.

- Inputs: the kind (portfolio or showcase), the trade, the legal identity of
  the owner, and the facts only the client has.
- Outputs: the content contract, the token profile, the no-code field map, the
  legal fact sheet, the completion gate report.
- Depends on: engineering-core.
- Run by: the site-template-engineer agent, and the frontend-engineer when an
  instance is produced.

A site delivered to a client is delivered twice: once as a page, and once as
something the client can still edit. This skill builds the second. Three
artefacts stay apart: the template, which holds no client fact and no visual
literal; the content file, which holds every string, image, colour, hour and
contact detail; and the tokens, chosen by trade rather than by taste, including
a motion intensity that separates an energetic profile from a technical one
without a second template. The no-code contract states exactly which fields the
client may change and is verified to be wired, because a field promised in the
handover and not connected is the defect the client finds first. Legal pages are
assembled from the company's real facts, with every fact not provided rendered
as a visible marker, never as a plausible invention, since an invented
registration number is a false legal statement published under the client's
name. Accessibility and responsive rules are applied while building, and a ten
point gate decides whether the template is finished.

Reference implementations in `examples/`: a one page portfolio for an
independent sports coach, and a multi page showcase for a building trade
company, both with clearly fictional content.
