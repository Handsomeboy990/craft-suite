# Charter outline

The order a reader applies the identity in: why first, then the mark, then
the materials, then the voice, then the record. Each section names its source
in the brief and each measured or licensed fact names its evidence.

```
0   Cover and record
    product name, charter version, date, status (draft | signed),
    who drafted it, who signed it off, the client's acceptance if any

1   Positioning
    the positioning sentence, the brief lines it rests on
    the personality traits, "this, not that", each with its evidence

2   Logo
    2.1 the brief: what the mark must do, must not do
    2.2 variants and the surface each is for
    2.3 clear space, in units of an element of the mark
    2.4 minimum size, screen and print, with how it was checked
    2.5 colour versions per theme and permitted grounds, measured
    2.6 misuse, each with an example

3   Colour
    3.1 roles, light and dark, with the raw values
    3.2 the measured pair table, pasted from the script, with the command
        and the date
    3.3 restrictions and companion colours, each with its reason
    3.4 status colours and their non-colour companions

4   Type
    4.1 families, each with its licence, its source and the date read
    4.2 coverage of the audience's scripts, as checked
    4.3 roles, scale ratio and base, steps with line heights
    4.4 weights in use, the size floor, the fallback stack

5   Imagery and iconography
    5.1 photography direction, and what is never shown
    5.2 illustration, if any
    5.3 icon family, its licence, grid, stroke and sizes
    5.4 alt text principle
    5.5 the truthfulness rule for images of the client's people,
        premises and product

6   Voice, brief
    traits as they apply to words, with a sentence that does it and one
    that does not; register per language; words used and avoided; what is
    never said. The full editorial line named as the next step.

7   Moodboard
    the record table, every reference with source and licence, the
    principle taken and what is not taken

8   Tokens
    the token file, its version, and where it lives in the repository;
    the semantic mapping per theme

9   Open questions
    each with its owner and whether it blocks; placeholders listed

10  Appendix
    the brief, the intake record, the client's answers quoted in full
```

## Rules for the document

- A section with no decision yet says so; it is not filled with a default.
- No ratio without the measured table, no licence without its source.
- When delivered as a document, `document-core` governs: the eight point
  gate, eleven when paginated, then `document-design` and `pdf-production`.
- The output language is the client's, set in the configuration; the
  structure above does not change with it.
- Versioned: a signed charter is never edited in place. A change produces a
  new version with a new sign-off.
