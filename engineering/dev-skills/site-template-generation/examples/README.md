# Worked examples

Two reference implementations, one per kind, built by running the protocol of
`SKILL.md` from end to end. Both are Next.js with a static export, both are
driven entirely by one content file, and both carry clearly fictional data.

| | `portfolio-sports-coach` | `showcase-electrician` |
|---|---|---|
| Kind | portfolio | showcase |
| Owner | an invented independent coach | an invented electrical company |
| Routes | one page, plus two legal routes | four pages, plus four legal routes |
| Profile | energetic | technical |
| Motion intensity | 0.9 | 0.25 |
| Form | a message | a quotation request |
| Legal | notice, privacy | notice, terms, privacy, cookies |

## The protocol, applied

1. **Kind, trade, identity.** A single person trading under their own name is a
   portfolio. A company with a legal form, a capital and a registration number
   is a showcase, and it owes four legal pages rather than two.
2. **Facts collected, gaps recorded.** Both instances are deliberately
   incomplete: no registration number, no host, no supervisory authority, and in
   the showcase no binding clause. Those gaps render as markers instead of being
   filled with plausible text.
3. **Contract fixed, validation written.** `lib/content.ts` in each project
   refuses a missing required field by name, an image without alt text, a
   non-https form endpoint, and in the showcase a missing legal page.
4. **Token profile chosen.** The same token keys, two sets of values. The whole
   difference between the two sites is in `theme`, not in a second template.
5. **Template built.** No client fact and no visual literal in any component,
   which is checkable with the search in section 10 of the skill.
6. **Legal pages generated.** `lib/legal.ts` assembles facts, and never drafts
   an obligation.
7. **Accessibility applied while building.** Skip link, landmarks, one h1 per
   page, labelled fields, visible focus, 44px targets, reduced motion honoured.
8. **Example content written.** Fictional throughout, and no photograph shipped.
9. **Gate run.** Both builds pass and export; both report their markers.
10. **Handover written.** The field map is the table at the end of each project
    README.

## Verifying the two builds

```bash
cd portfolio-sports-coach && npm install && npm run build
cd ../showcase-electrician && npm install && npm run build
```

Each produces a static export in `out/`. The portfolio exports the home page and
its two legal pages; the showcase exports four pages and its four legal pages.

Two deliberate failures are worth running once, because they are the contract
defending itself:

```
remove hero.title from the portfolio content
  -> content/content.json: required field missing: hero.title

remove the terms entry from legal.pages in the showcase content
  -> content/content.json: legal page missing for a showcase site: terms
```

## What was observed, not assumed

Run on both projects before they were committed:

```
build and export       portfolio 6 pages, showcase 11 pages, both exit 0
required field         hero.title removed: the build stops naming the field
required legal page    terms removed: the build stops naming the kind
optional sections      the four optional blocks and their navigation entries
                       removed from the portfolio content: the build succeeds
                       and the exported page carries only the about and contact
                       sections, with no empty frame
one token changed      theme.palette.accent changed: the new value is the one
                       in the exported page
legal markers          in the export: the showcase terms page renders six
                       clause markers and one fact marker, the legal notice six
                       fact markers, the privacy page one, the cookie page none
cookie page            the site sets none, and the page says so rather than
                       listing cookies it does not use
no literals            no hex colour, no font family and no duration outside
                       the tokens, in either stylesheet or any component
contrast               every pair the skill requires, computed from the two
                       palettes: all pass. The first run did not, which is why
                       the palette now carries two border tokens, a decorative
                       one with no minimum and a control one measured at 3:1
```

## What these examples are not

They are not a design to copy onto a client. They are the smallest complete
proof that the contract in `SKILL.md` holds: content, tokens and template stay
apart, the no-code fields are real, and the legal pages say only what the
company actually declared.
