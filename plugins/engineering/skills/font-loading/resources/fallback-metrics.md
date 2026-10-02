# Fallback metrics

How to compute a fallback face whose glyphs occupy the same space as the web
font, so the swap does not move the layout. Every number here is derived from
the two fonts involved and then verified on screen; none is copied from
another project, because a different font version gives different numbers.

## What moves on a swap

```
horizontal   glyph advances differ, so lines wrap at different words and a
             paragraph changes height
vertical     ascent, descent and line gap differ, so the line box changes
             height even when the wrapping does not
```

`size-adjust` corrects the first. The three overrides correct the second.

## Inputs

Read from the web font file, in font units:

```
unitsPerEm     the em square, often 1000 or 2048
ascent         the ascender the browsers use for line layout
descent        the descender, as a positive magnitude
lineGap        the line gap
```

Which table the browsers read differs between platforms and depends on the
font's flags: the hhea values in most cases, the OS/2 typographic values when
the font sets the USE_TYPO_METRICS flag. Read both with a font inspection tool
from the build tooling, note which one applies, and let the overlay check in
the last section settle any doubt.

Measured, not read:

```
widthWeb       rendered width of a representative text sample in the web font
widthFallback  rendered width of the same sample, same font-size, in the
               fallback font
```

The sample is real copy from the site in its main language, a few hundred
characters, not the alphabet: letter frequencies decide the average width.
The OS/2 average character width field is a usable first estimate when
measurement is not yet possible, and is replaced by the measured ratio.

## Formulas

```
size-adjust        = widthWeb / widthFallback
ascent-override    = (ascent  / unitsPerEm) / size-adjust
descent-override   = (descent / unitsPerEm) / size-adjust
line-gap-override  = (lineGap / unitsPerEm) / size-adjust
```

All four are written as percentages. The division by `size-adjust` is the
step most often missed: `size-adjust` scales every metric of the face,
overrides included, so an override computed without it is applied twice.

## One fallback per platform

The numbers fit one fallback font. A stack such as Arial on desktop and
Roboto on Android needs either:

```
one fallback @font-face per platform font, each with its own numbers, listed
  in order in the font-family stack, the first one present winning
or one face with the numbers of the most common platform, the residual shift
  on the others measured and recorded as accepted
```

A fallback `src: local()` that names a font the platform does not have makes
that face fail, and the stack moves on. This is why each platform needs its
own face rather than several `local()` entries sharing one set of numbers.

## Per face, not per family

Bold text in a fallback is synthesised from the regular, and the widths
differ from the bold web face. When bold or heading text is a large part of
the first viewport, compute a second fallback face for that weight, declared
with the matching `font-weight` descriptor.

## Verification

```
1  render the same paragraph twice, positioned over each other: once in the
   web font, once with the web font disabled so the fallback face applies
2  at every size in the type scale that appears in the first viewport, the
   line breaks match and the block heights match within a pixel or two
3  in a throttled load with the cache disabled, record the layout shift
   entries during the swap; they should be absent or negligible
4  repeat on each platform whose fallback has its own numbers
```

If the overlay disagrees with the formulas, the overlay wins: re-read which
metric table applies and remeasure the widths.
