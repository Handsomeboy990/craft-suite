# Decision rules by barrier family

One table per family. Each row is a situation the audit found, the fix to make,
in the order to try it, and the change to refuse because it quiets a scanner
without removing the barrier. Criteria are WCAG 2.2; the tool column of
`accessibility-testing` `resources/criteria-map.md` says which of them a
scanner can see at all.

A fix is never claimed here. Every row ends at "ready for verification", and
the verify loop of `accessibility-testing` decides.

## Images and non-text content

Criteria: 1.1.1 Non-text Content, 1.4.5 Images of Text.

| The image | Fix | Refuse |
|---|---|---|
| carries information stated in the source | the information as the alternative, in words a person would say; a fact everyone needs (an entrance, a price, a deadline) also as visible text | `alt` naming the kind of image ("map", "photo", "chart") |
| carries information too long for an alternative (a chart, a diagram) | a short alternative naming it, and the data or description as text next to it, linked by proximity or `aria-describedby` | the whole table squeezed into `alt` |
| decorates, according to the source or a person | `alt=""`, no `title`, or the image moved to CSS | `alt=""` chosen because it silences the rule |
| sits alone inside a link or a button | the name of the destination or the action | the name of the picture |
| shows text | real text, styled | an alternative repeating the text while the image stays |
| has no stated purpose anywhere | escalate: inform, decorate or act | any guess, empty or not |

## Names

Criteria: 4.1.2 Name, Role, Value; 2.5.3 Label in Name; 2.4.6 Headings and
Labels; 2.4.4 Link Purpose.

| The control | Fix | Refuse |
|---|---|---|
| has a visible label not tied to it | tie it: `label for`, or `aria-labelledby` to the visible text | `aria-label` repeating the visible text |
| has a visible label and a different accessible name | make the name start with the visible words | a name a voice control user cannot say |
| shows only an icon | a name with the action and the object ("Remove guest 2"), unique among repeated siblings; the icon `aria-hidden` | "button", "icon", "close" repeated on every row |
| is a link whose text means nothing alone | rewrite the link text, or add the missing words visually hidden after it | `title` as the only fix |
| needs a label two people would word differently | escalate: which label would the people using it recognise | the developer's own term |

## Roles and keyboard

Criteria: 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 4.1.2.

| The element | Fix | Refuse |
|---|---|---|
| a div or span with a click handler that acts | a `button type="button"` | `role="button"`, with or without `tabindex` |
| a div or span with a click handler that navigates | an `a` with a real `href` | a button that changes the location |
| a link that acts | a `button` | `role="button"` on the link |
| a positive `tabindex` | remove it and fix the source order | another positive value |
| a trap with no exit | an exit by Escape or Tab, and focus returned to the trigger | removing the trap from a modal that needs one |

## Forms

Criteria: 1.3.1 Info and Relationships, 1.3.5 Identify Input Purpose, 3.3.1
Error Identification, 3.3.2 Labels or Instructions, 3.3.3 Error Suggestion,
4.1.3 Status Messages.

| The field | Fix | Refuse |
|---|---|---|
| labelled only by a placeholder | a visible `label` tied to it; the placeholder may stay as an example | `aria-label` copying the placeholder |
| required, shown only by colour or an asterisk | the word "required" in the label, or `required` on the field | an asterisk with a legend at the bottom of the page |
| shows an error nobody hears | the error as text, tied by `aria-describedby`, the field `aria-invalid="true"`, focus moved to it or to a summary linking to it | a live region created with the message |
| loses its value after a failed submit | keep it | asking the person to type it again |
| asks for personal data | the matching `autocomplete` token | none |
| belongs to a group (radios, a date in three parts) | `fieldset` and `legend` | a heading above the group |

## Focus

Criteria: 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.3 Focus Order,
1.4.11 Non-text Contrast.

| The problem | Fix | Refuse |
|---|---|---|
| indicator removed | remove the suppression; style `:focus-visible` with an outline of at least 2 CSS pixels at 3 to 1 against its surroundings, offset when the control is filled | a transparent outline, or a colour change alone |
| indicator hidden under a sticky header or a banner | scroll padding or a layout that leaves the focused element in view | hiding the banner |
| order differs from the reading order | fix the source order | `tabindex` values |
| focus lost after an action | move it to the result, the next step, or back to the trigger | leaving it on `body` |
| dialog does not take or return focus | the platform `dialog` with `showModal`, or the project's accessible primitive | a hand-written trap when a primitive exists |

## Contrast and colour

Criteria: 1.4.3 Contrast (Minimum), 1.4.11, 1.4.1 Use of Color.

| The problem | Fix | Refuse |
|---|---|---|
| text below 4.5 to 1, large text below 3 to 1 | use the token that passes; if none does, change the token through `design-system` and re-measure every pair it feeds | a new colour value in one rule |
| control boundary or icon below 3 to 1 | the same, for the non-text token | thicker strokes with the same failing colour |
| meaning carried by colour alone | add text, an icon or a pattern | a darker shade of the same colour |
| text over an image | a scrim or a solid background behind the text, measured at every crop | a measurement at one width |

## Dynamic content and custom widgets

Criteria: 4.1.2, 4.1.3, 2.1.1.

| The component | Fix | Refuse |
|---|---|---|
| custom select, combobox, checkbox, radio or switch | escalate the native replacement, recommending it; on yes, the native element | ARIA roles over the divs, shipped as the fix |
| custom widget kept by a recorded decision | the full keyboard pattern for its role, every key covered by a check | the role alone |
| status that appears after an action | a `role="status"` region present at load, its text changed | a region inserted with its text |
| disclosure or accordion | a `button` with `aria-expanded`, the panel after it | an icon rotating as the only state |

## Layout and targets

Criteria: 1.4.4 Resize Text, 1.4.10 Reflow, 1.4.12 Text Spacing, 2.5.8 Target
Size (Minimum).

| The problem | Fix | Refuse |
|---|---|---|
| horizontal scroll at 320 CSS pixels | flexible widths; wide content scrolls in its own container | hiding the overflowing content |
| clipped text under spacing overrides | heights that grow with their content | a smaller font |
| target below 24 by 24 | a larger hit area, or the spacing the exception requires | a larger icon in the same small hit area |

## Time and motion

Criteria: 2.2.1 Timing Adjustable, 2.2.2 Pause, Stop, Hide, 2.3.1 Three
Flashes, 2.3.3 Animation from Interactions (level AAA, held by the suite).

| The problem | Fix | Refuse |
|---|---|---|
| content moves for more than five seconds | a visible pause control | pausing on hover only |
| motion ignores reduced motion | the reduced motion query turns it off or replaces it with a fade | a shorter duration |
| a time limit | warning and extension, or no limit | a longer limit |
| it is unclear whether the timing or motion is essential | escalate | removing it without asking |
