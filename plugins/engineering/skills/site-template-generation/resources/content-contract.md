# Content contract

The field by field contract of the content file, one per template kind. Fixed
per kind: one contract is what lets a single administration surface, a single
validator and a single handover serve every instance.

Notation: `R` required, refused at build with a message naming the field. `O`
optional, and absent means the section does not render at all.

## Common root, both kinds

| Key | | Type | Holds |
|---|---|---|---|
| `site.name` | R | string | the name shown in the header and the title |
| `site.locale` | R | string | the BCP 47 tag driving the html lang attribute |
| `site.baseUrl` | R | string | the canonical origin, used by metadata and sitemap |
| `site.tagline` | O | string | one line under the name |
| `theme` | R | object | the token profile, see `trade-profiles.md` |
| `nav` | R | array | ordered entries, each `{ label, href }` |
| `contact.email` | R | string | shown and used by the mailto fallback |
| `contact.phone` | O | string | shown as typed, linked as tel |
| `contact.address` | O | object | `{ street, postalCode, city, country }` |
| `contact.hours` | O | array | `{ days, opens, closes }`, empty renders nothing |
| `contact.social` | O | array | `{ platform, url }` |
| `forms.endpoint` | O | string | where a form posts; absent falls back to mailto |
| `forms.successMessage` | R | string | shown after a successful send |
| `forms.errorMessage` | R | string | shown when the endpoint fails |
| `seo.title` | R | string | the document title of the home page |
| `seo.description` | R | string | the meta description of the home page |
| `seo.ogImage` | O | object | `{ src, alt }` |
| `legal` | R | object | the legal facts, see `legal-fact-sheet.md` |

## portfolio

One page, anchored sections. Every section below the hero is optional; absent
means the section and its navigation entry both disappear.

| Key | | Type | Holds |
|---|---|---|---|
| `hero.title` | R | string | the one line that says who this is |
| `hero.subtitle` | O | string | the second line |
| `hero.image` | R | object | `{ src, alt }` |
| `hero.actions` | O | array | `{ label, href, variant }`, variant `primary` or `ghost` |
| `about.heading` | R | string | the section heading |
| `about.body` | R | array | paragraphs, plain strings |
| `about.portrait` | O | object | `{ src, alt }` |
| `about.facts` | O | array | `{ label, value }`, the short credential row |
| `offers` | O | array | `{ title, description, price, duration, highlight }` |
| `gallery` | O | array | `{ src, alt, caption }` |
| `results` | O | array | `{ metric, label, detail }` |
| `testimonials` | O | array | `{ quote, author, context }` |
| `contactSection.heading` | R | string | the heading of the contact block |
| `contactSection.body` | O | string | one paragraph above the form |
| `contactSection.fields` | R | array | the message form, see the form section |

`offers[].price` is a string, not a number: a price is displayed exactly as the
owner wrote it, including a currency, a qualifier or an absence.

## showcase

Several routes. The home page composes the sections below; the other pages read
their own block.

| Key | | Type | Holds |
|---|---|---|---|
| `company.legalName` | R | string | the registered name |
| `company.tradeName` | O | string | the name used commercially |
| `company.activity` | R | string | one sentence naming the trade |
| `company.serviceArea` | O | array | the areas served, plain strings |
| `home.hero` | R | object | `{ title, subtitle, image, actions }` |
| `home.highlights` | O | array | `{ title, body, icon }` |
| `home.proof` | O | array | `{ label, value }` |
| `services` | R | array | `{ slug, title, summary, body, image, bullets }` |
| `about.heading` | R | string | the about page heading |
| `about.body` | R | array | paragraphs |
| `about.team` | O | array | `{ name, role, portrait }` |
| `about.credentials` | O | array | `{ label, value, issuedBy }` |
| `quote.heading` | R | string | the heading of the quotation page |
| `quote.body` | O | string | one paragraph above the form |
| `quote.fields` | R | array | the quotation form, see the form section |
| `pages` | R | array | the routes, `{ slug, label, inNav }` |

`about.credentials` holds only what the company provided. A certification, an
insurance policy or a registration number that was not given is absent from the
array, not invented into it.

## Form fields

Both kinds describe their forms as data, so a field can be added without a
developer while validation stays in the template.

```
{ name, label, type, required, placeholder, options }

type      text | email | tel | textarea | select | checkbox
options   only for select, an array of strings
required  drives both the attribute and the validation message
```

The template validates by type and by `required`. It never evaluates anything
the content file contains, because the client edits that file.

## Validation

The validator runs at build time and refuses, by name, the first missing
required field. It also refuses:

- an image object without `alt`, since alt text is content;
- a `nav` entry pointing at a section that does not exist in the content;
- a `theme` missing a token the template reads;
- a `forms.endpoint` that is neither absent nor an absolute https URL.

Silently defaulting any of those produces a site that looks finished and is not.
