# Motion system

Two values in the content file drive every movement: the signature says which
effects exist, the intensity says how far they go. A scalar alone gives the same
site twice at different speeds; the signature is what makes a trade's page move
in its own way.

## The two values

```
theme.motion.signature     energetic | creative | crafted | technical | clinical
theme.motion.intensity     0 to 1
theme.motion.baseDuration  milliseconds at intensity 1
theme.motion.easing        a curve, not a keyword picked at random
```

Everything derives:

```
--motion-duration   baseDuration * intensity
--motion-travel     the reveal distance * intensity
--motion-stagger    the delay between two items of a list * intensity
--motion-lift       the hover rise, 0 at intensity 0
```

`prefers-reduced-motion: reduce` forces the effective intensity to zero, whatever
the content file says. That is a hard requirement, not a courtesy.

## What each signature turns on

| Effect | energetic | creative | crafted | technical | clinical |
|---|---|---|---|---|---|
| entrance | yes | yes | yes | no | no |
| reveal | yes | yes | yes | yes | yes |
| stagger | yes | yes | yes | no | no |
| counters | yes | no | yes | no | no |
| parallax | yes | yes | no | no | no |
| lift | yes | yes | yes | yes | no |

```
entrance   the first screen assembles once on load: title, then subtitle, then
           actions. Never on a later navigation, never a second time
reveal     a section fades and rises as it enters the viewport, once, then the
           observer stops watching it
stagger    the items of a list follow one another. The delay sits on each item
           with its index; a delay on the container is not a stagger and looks
           like nothing
counters   a figure counts to its value when it becomes visible, keeping the
           suffix the content wrote: "8 sem." counts the 8 and keeps " sem."
parallax   the hero image moves slower than the page, on transform only, driven
           by one scroll listener that writes a custom property
lift       cards and buttons rise a few pixels under the pointer
```

## The rule that makes a script failure harmless

The hidden state is applied by the script, never by the stylesheet. Each motion
component adds a class to itself on mount, and every rule that hides something
is scoped under that class:

```
.motion-on .reveal-item      hidden, because the script decided motion is on
.motion-on.is-visible .item  shown, when the observer fired
no class at all              everything visible, which is what a browser with no
                             JavaScript, no IntersectionObserver or a reduced
                             motion preference gets
```

A reveal implemented by hiding in CSS and showing in JavaScript turns a script
failure into a blank page. This one turns it into a page without animation.

## Techniques, cheapest first

```
1  a CSS transition on transform or opacity. Covers every interactive state
2  a CSS transition triggered by a class an observer adds
3  an IntersectionObserver, one per section, disconnected after it fires
4  a small amount of JavaScript for a value that must be computed: a counter, or
   a scroll position written into a custom property
```

Nothing here needs an animation library. A library is a dependency decision under
`dependency-selection`, justified by an effect this ladder cannot produce.

## What never moves

- The first screen beyond its entrance, which happens once.
- Anything while a form is being filled.
- Anything that shifts layout: no animated height, width, top or margin.
- A focus ring. It appears instantly or it is not an accessibility feature.
- Anything triggered by a hover on a touch device, where hover does not exist.

## Verification

```
at 0        no movement anywhere, the site complete and usable
mid range   reveals, stagger and interactive states; no counter, no parallax
at 1        the whole signature, no layout shift, no dropped frame
reduced     the same as 0, with the content file untouched
no JS       every section visible, nothing stuck hidden
by trade    the effects the signature names happen, and the ones it does not
            name do not: a technical instance has no counter and no parallax
sequence    a staggered list arrives item by item, not as a block
```
