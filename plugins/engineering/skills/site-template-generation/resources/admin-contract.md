# Back office contract

What the client can do without a developer, how the surface is built, and how
the promise is verified. This file is the source of the handover table; it is
not prose, it is the contract.

## The surface

| Section | Edits | Writes to |
|---|---|---|
| Content | every visitor facing string, section by section, in page order | the content file |
| Media | upload, replace, delete an image, alt text required | the uploads directory and the content file |
| Theme | both palettes, motion intensity, density | the content file |
| Contact | address, telephone, email, opening hours, social links | the content file |
| Legal | the legal facts and the clauses provided by counsel | the content file |
| Messages | the contact inbox: unread, read, archived | the message store |
| Notifications | the browser subscription for a new message | the subscription store |

## Editable, not editable

| Editable without a developer | Not editable |
|---|---|
| every visitor facing string, including headings and the 404 | the structure of a page |
| every image and its alt text | the components |
| both palettes, the type scale, the radius | the routing |
| the motion intensity and the density | the validation rules |
| opening hours, contact details, social links | the shape of the contract |
| the order and visibility of optional sections | the breakpoints, which a media query cannot read from a token |
| the search title and description | what a form does with a submission |
| the form fields and where they are sent | the legal clauses that bind |
| the legal facts | the secrets the instance runs on |

## The shape the content file must keep

```
flat enough   values and lists of values, so a generated form can render it
no expression no formula, no condition, no template syntax inside a value
no markup     beyond a declared inline subset, currently none; a paragraph is a
              string, a list of paragraphs is an array of strings
no logic      the back office writes this file, and editing text must never be
              able to break the site
stable keys   a key is never renamed after delivery; a new key is added and the
              old one kept until the instance's file is migrated
```

## The field map

Every editable field is delivered in a table with four columns, generated from
the content contract rather than written by hand, so it cannot drift.

```
field       the path in the content file, for example offers.items[2].price
type        string, number between 0 and 1, image reference, list of objects
limits      what the template assumes, for example "shown as typed" or "0 to 1"
changes     what the visitor sees change, named by section
```

## Verification, before the handover is written

For every row in the field map:

1. Sign in to the back office.
2. Change the value there.
3. Reload the public page.
4. Observe the change.

A row that cannot be demonstrated this way is removed from the map or wired
properly. A field map is a set of promises; an unverified promise is the defect
the client finds first and trusts you least for.

## What the handover must say in words

- The address of the back office, and that the account is theirs alone.
- That a content change is live on reload, with no rebuild and no developer.
- Where the data directory is, what it holds, and the command that backs it up.
- Which fields are required, and that emptying one is refused by name.
- That an image is replaced with its alt text updated, because alt text is
  content and not decoration.
- Which legal facts are still missing, and that the site shows a marker until
  they are provided.
- How the site is started, restarted and updated, and what happens to the data
  directory in each case.
- Which secrets the instance needs, and who holds them.
