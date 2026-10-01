# Font face checklist

Run against the deployed pages and the built files, never against the design
file or the source stylesheet alone.

## Fatal, check these first

```
a font request to any origin other than the site's own
a font file in the repository with no recorded licence
a commercial font served outside the terms of its web licence
font-display missing on any @font-face
text invisible for more than a frame on a throttled first load
a preload whose URL does not match any @font-face src, so it downloads a
  file nothing uses, or the same file twice
```

## Files

```
woff2 only, unless the support matrix names a browser that needs more
one file per subset per face, or a variable file where it saves bytes
file names carry a hash or version
licence text stored next to the files
no unused weight or style shipped
```

## Declarations

```
one @font-face per subset per face, same family name across them
unicode-range present and equal to the subset's real coverage
font-weight and font-style match the file, ranges for variable axes
src: url() with format("woff2"), no local() for the primary face
font-display chosen per role and written down
font-synthesis: none once every needed face is declared
the rules live in the first stylesheet or inline in the head
```

## Preload

```
one preload, the critical face and subset
as="font", type="font/woff2", crossorigin present
URL identical to the src URL
the preloaded file is actually used in the first viewport; the browser
  console warns about an unused preload, check it
```

## Fallback

```
a fallback @font-face per platform font that matters, with size-adjust and
  the three overrides
numbers derived from the method in fallback-metrics.md
verified by overlay at the sizes in the first viewport
listed directly after the web font in the font-family stack
```

## Delivery

```
Content-Type: font/woff2
Cache-Control with a long max-age and immutable, because names are hashed
Access-Control-Allow-Origin present if the files live on another hostname
no extra compression layer on woff2
```

## Measurement, before and after

```
CLS attributed to the font swap
LCP when the LCP element is text
font bytes on first view per template
font request count and origins
invisible text duration from a filmstrip
conditions recorded: device profile, network profile, cache state, browser
```
