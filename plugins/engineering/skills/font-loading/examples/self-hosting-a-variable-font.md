# Example: moving a site off a third-party font service

The situation: a marketing site in English and French loads one sans-serif
family from a public font service, through a stylesheet link in the head. The
family is licensed under the SIL Open Font License. The figures below show the
method; a real project records its own, measured under its own conditions.

## Inventory, from rendered pages

```
family     Example Sans
requested  six static faces: 300, 400, 500, 600, 700, 800, plus 400 italic
rendered   400 body, 400 italic in quotes, 600 interface labels, 700 headings
scripts    latin, plus the accented characters of French
critical   400 regular, latin: the hero paragraph is the LCP element
licence    OFL 1.1, no Reserved Font Name declared, licence file obtained
           from the font's own repository and recorded
```

Three of the seven requested faces were never rendered. That alone is the
largest saving in the whole exercise.

## Before

```
requests   one stylesheet and several font files, all on two third-party
           origins, each needing its own connection
display    swap, set by the service
CLS        visible shift of the hero paragraph and the navigation on swap
privacy    every page view sent the visitor's address to the font service
           before the consent banner rendered
```

## Decision: variable or static

```
static     400, 400 italic, 600, 700, latin subset each: four files
variable   one upright file covering 400 to 700, one italic file, latin
           subset each: two files
```

The byte counts of both options were measured after subsetting. The variable
upright file was lighter than the three static upright faces together and
heavier than any single one; with three upright weights rendered, the variable
option won and was recorded with both totals.

## Subsets

```
latin       basic Latin, Latin-1 supplement (covers French accents), the
            typographic quotes, dashes, ellipsis, euro sign, non breaking
            space and narrow no-break space used by French punctuation
latin-ext   everything else Latin, for names in user content; declared with
            its own unicode-range, downloaded only on pages that need it
```

The French narrow no-break space before a colon or a question mark was the
character the first subset forgot. It appeared in the fallback font on every
French page until the overlay check caught it.

## Declarations

```
@font-face {
  font-family: "Example Sans";
  src: url("/fonts/example-sans-latin-wght.3f9a1c.woff2") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
  unicode-range: <the latin range, as built>;
}
/* the same for latin-ext, and for the italic file */

@font-face {
  font-family: "Example Sans Fallback";
  src: local("Arial");
  size-adjust: 106.04%;
  ascent-override: 89.58%;
  descent-override: 23.58%;
  line-gap-override: 0%;
}

body {
  font-family: "Example Sans", "Example Sans Fallback", sans-serif;
  font-synthesis: none;
}
```

The fallback numbers came from `resources/fallback-metrics.md`: the sample
paragraph rendered 1000 px wide in Example Sans and 943 px in Arial, giving a
size-adjust of 1000 / 943 = 106.04 percent; the font's ascent of 0.95 em and
descent of 0.25 em were then divided by that factor. The overlay matched line
breaks at 16, 18 and 40 px. `swap` was kept on body text because the
fallback was metric-matched; without it, `fallback` would have been chosen.

## Preload

```
<link rel="preload" href="/fonts/example-sans-latin-wght.3f9a1c.woff2"
      as="font" type="font/woff2" crossorigin>
```

One preload: the upright latin file, which carries the hero paragraph. The
italic and latin-ext files are discovered normally.

## Delivery

```
Content-Type: font/woff2
Cache-Control: public, max-age=31536000, immutable
the hash in the file name changes whenever the file does
OFL.txt stored next to the files
the third-party stylesheet link and the preconnect hints removed
```

## After, same pages, same throttled profile

```
requests   font files only on the site's own origin, two on first view
CLS        no layout shift entry attributed to the swap
LCP        the hero paragraph rendered in the fallback without delay, the
           swap no longer moving it
privacy    no request to any third-party origin before consent
```

The budget report recorded both runs, the profile used and the browser, and
went to `performance-engineering` with the diff for `code-review-protocol`.
