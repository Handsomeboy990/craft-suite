# No-code administration contract

What the client may change after delivery, in what form, and how the promise is
verified. This file is the source of the handover table; it is not prose, it is
the contract.

## Editable, not editable

| Editable without a developer | Not editable |
|---|---|
| every visitor-facing string, including headings | the structure of a page |
| every image and its alt text | the components |
| the palette, the type scale, the radius | the routing |
| the motion intensity | the validation rules |
| opening hours, contact details, social links | the shape of the contract |
| the order and visibility of optional sections | the build pipeline |
| the search title and description | the breakpoints, which a media query cannot read from a token |
| the form fields and the form endpoint | what a form does with a submission |
| the legal facts | the legal clauses that bind |

## The shape the content file must keep

```
flat enough   values and lists of values, so a form editor can render it
              without knowing the template
no expression  no formula, no condition, no template syntax inside a value
no markup      beyond a declared inline subset, currently none; a paragraph is
              a string, a list of paragraphs is an array of strings
no logic       the client edits this file, and editing text must not be able to
              break the build
stable keys    a key is never renamed after delivery; a new key is added and
              the old one kept until the client's file is migrated
```

## The field map

Every editable field is delivered in a table with four columns. The table is
generated from the content contract, not written by hand, so it cannot drift.

```
field       the path in the content file, for example offers[2].price
type        string, number between 0 and 1, image object, array of objects
limits      what the template assumes, for example "shown as typed, no length
            limit, wraps at any length" or "0 to 1"
changes     what the visitor sees change, named by section
```

## Verification, before the handover is written

For every row in the field map:

1. Change the value in the content file.
2. Rebuild.
3. Observe the change in the rendered page.

A row that cannot be demonstrated this way is removed from the map or wired
properly. A field map is a set of promises; an unverified promise is the defect
the client finds first and trusts you least for.

## What the handover must say in words

- A content change requires a rebuild, and how that rebuild is triggered.
- Where the content file lives and who may edit it.
- Which fields are required, and that removing one stops the build with a
  message naming it, which is deliberate.
- That an image must be replaced with its alt text updated, because alt text is
  content and not decoration.
- Which legal facts are still missing, if any, and that the site shows a marker
  until they are provided.
