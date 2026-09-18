# template-selection

Finds clean, licence-clear templates that actually fit a project, shortlists a
few with their trade-offs for the user to choose, and hands the chosen one to
customisation.

- Inputs: the project (type, stack, features, identity) and the licence terms
  it can accept.
- Outputs: the project-fit brief, the template shortlist with trade-offs, the
  licence check, the handoff to customisation.
- Depends on: engineering-core.
- Run by: the design-research agent and the ui-ux-engineer, before building.

Starting from a good template beats a blank page and a bad one. The skill
understands the project first, because "templates that resemble the project" is
meaningless without it; searches legitimate sources only; judges each candidate
on fit, cleanliness (with design-authenticity, so a vibe-coded template is not
called clean because it looks modern), licence, quality and the real cost, which
is customisation not download; shortlists a handful for the user to choose from,
never deciding for them; confirms the chosen template's licence permits the use
and records its provenance; and then hands off to customisation, because a
template shipped unchanged is exactly the generic default a real product should
not have. The result that ships is the project's own design on a licensed
foundation, not a clone of the template's demo.
