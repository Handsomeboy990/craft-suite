# Content contract

The field by field contract of the content file, one per template kind. Fixed
per kind: one contract is what lets a single back office, a single validator and
a single handover serve every instance.

The file lives in the instance's writable data directory, not in the bundle,
because the back office writes it while the site runs.

Notation: `R` required, refused at load with a message naming the field. `O`
optional, and absent means the section does not render at all.

## Common root, both kinds

| Key | | Type | Holds |
|---|---|---|---|
| `site.name` | R | string | the name in the header, the footer and the titles |
| `site.shortName` | O | string | the installed application name, 12 characters or fewer |
| `site.locale` | R | string | the BCP 47 tag driving the html lang attribute |
| `site.baseUrl` | R | string | the canonical origin, used by metadata and the manifest |
| `site.tagline` | O | string | one line under the name |
| `theme.palettes.light` | R | palette | the light theme, see `trade-profiles.md` |
| `theme.palettes.dark` | R | palette | the dark theme, authored on its own |
| `theme.type` | R | object | display family, text family, scale ratio, weights |
| `theme.radius` | R | object | sm, md, lg, pill |
| `theme.spacing` | R | object | unit, section, `pageWidth`, `proseWidth` |
| `theme.motion` | R | object | intensity 0 to 1, base duration, easing |
| `theme.density` | R | string | compact, regular or airy |
| `nav` | R | array | ordered entries, each `{ label, href }` |
| `ui` | R | object | the interface strings, below |
| `contact.email` | R | string | shown, and the fallback destination |
| `contact.phone` | O | string | shown as typed, linked as tel |
| `contact.address` | O | object | `{ street, postalCode, city, country }` |
| `contact.hours` | O | array | `{ days, opens, closes }`, empty renders nothing |
| `contact.social` | O | array | `{ platform, url }` |
| `forms.successMessage` | R | string | shown after a stored submission |
| `forms.errorMessage` | R | string | shown when the submission failed |
| `forms.notifyEmail` | O | string | where a copy is sent, when configured |
| `seo.title` | R | string | the document title of the home page |
| `seo.description` | R | string | the meta description, and the manifest description |
| `seo.ogImage` | O | image | `{ src, alt }` |
| `pwa.enabled` | R | boolean | whether the manifest and the worker are served |
| `pwa.icons` | O | array | `{ src, sizes, purpose }`, uploaded by the client |
| `legal` | R | object | the legal facts, see `legal-fact-sheet.md` |

## `ui`, the interface strings

Every word the visitor reads that is not section content. In the content file
for the same reason as the rest, and because a template serving another language
cannot carry them in its components.

| Key | | Holds |
|---|---|---|
| `ui.skipToContent` | R | the skip link |
| `ui.primaryNavLabel` | R | the accessible name of the main navigation |
| `ui.footerNavLabel` | R | the accessible name of the footer navigation |
| `ui.themeToggleLabel` | R | the accessible name of the theme switch |
| `ui.themeLight`, `ui.themeDark`, `ui.themeSystem` | R | the three choices |
| `ui.contactHeading`, `ui.hoursHeading` | R | the contact block headings |
| `ui.form.*` | R | submit, sending, optional hint, select placeholder, invalid message |
| `ui.notFound.title`, `ui.notFound.body`, `ui.notFound.action` | R | the 404 page |
| `ui.offline.title`, `ui.offline.body`, `ui.offline.action` | R | the offline page |
| `ui.install.label`, `ui.install.dismiss` | O | the install prompt, absent means no prompt |
| `ui.legalPendingNotice` | R | the notice above a legal page carrying markers |

## portfolio

One page, anchored sections. Every section below the hero is optional; absent
means the section and its navigation entry both disappear.

| Key | | Type | Holds |
|---|---|---|---|
| `hero.title` | R | string | the one line that says who this is |
| `hero.subtitle` | O | string | the second line |
| `hero.image` | R | image | `{ src, alt }` |
| `hero.actions` | O | array | `{ label, href, variant }`, variant `primary` or `ghost` |
| `about.heading` | R | string | the section heading |
| `about.body` | R | array | paragraphs, plain strings |
| `about.portrait` | O | image | `{ src, alt }` |
| `about.facts` | O | array | `{ label, value }`, the short credential row |
| `offers` | O | section | `{ heading, items: [{ title, description, price, duration, highlight }] }` |
| `gallery` | O | section | `{ heading, items: [{ src, alt, caption }] }` |
| `results` | O | section | `{ heading, items: [{ metric, label, detail }] }` |
| `testimonials` | O | section | `{ heading, items: [{ quote, author, context }] }` |
| `contactSection.heading` | R | string | the heading of the contact block |
| `contactSection.body` | O | string | one paragraph above the form |
| `contactSection.fields` | R | array | the message form, see the form section |

`offers.items[].price` is a string, not a number: a price is displayed exactly as
the owner wrote it, including a currency, a qualifier or an absence.

## showcase

Several routes. The home page composes the sections below; the other pages read
their own block.

| Key | | Type | Holds |
|---|---|---|---|
| `company.legalName` | R | string | the registered name |
| `company.tradeName` | O | string | the name used commercially |
| `company.activity` | R | string | one sentence naming the trade |
| `company.serviceArea` | O | array | the areas served, plain strings |
| `pages` | R | array | the routes, `{ href, label, inNav }` |
| `home.hero` | R | object | `{ title, subtitle, image, actions }` |
| `home.highlights` | O | section | `{ heading, items: [{ title, body }] }` |
| `home.proof` | O | section | `{ heading, items: [{ label, value }] }` |
| `services` | R | section | `{ heading, intro, items: [{ slug, title, summary, body, image, bullets }] }` |
| `about.heading` | R | string | the about page heading |
| `about.body` | R | array | paragraphs |
| `about.image` | O | image | the company image |
| `about.teamHeading` | O | string | required when `about.team` is present |
| `about.team` | O | array | `{ name, role, portrait }` |
| `about.credentialsHeading` | O | string | required when `about.credentials` is present |
| `about.credentials` | O | array | `{ label, value, issuedBy }` |
| `quote.heading` | R | string | the heading of the quotation page |
| `quote.body` | O | string | one paragraph above the form |
| `quote.fields` | R | array | the quotation form, see the form section |

`about.credentials` holds only what the company provided. A certification, an
insurance policy or a registration number that was not given is absent from the
array, not invented into it.

## Form fields

Both kinds describe their forms as data, so a field can be added from the back
office while the validation stays in the template.

```
{ name, label, type, required, placeholder, options }

type      text | email | tel | textarea | select | checkbox
options   only for select, an array of strings
required  drives the attribute, the client side hint and the server rejection
```

The server validates by type and by `required` and stores the result in the
message store. It never evaluates anything the content file contains.

## Validation

The loader runs on every read of the content file and refuses, by name, the
first missing required field. It also refuses:

- an image reference without `alt`, since alt text is content;
- a `nav` entry pointing at a section that does not exist in the content;
- a palette missing a token the template reads, in either theme;
- a `theme.motion.intensity` outside 0 to 1;
- an optional section present without its heading;
- for a showcase, a missing legal page that the kind requires.

The same validation runs before the back office writes, so a rejected edit
changes nothing on disk.
