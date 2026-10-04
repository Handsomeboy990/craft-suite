# Browser pass

The first real-browser pass over `@craft-suite/ui`. Until this pass every
component had been tested in jsdom only, which has no layout, no sticky
positioning, no compositor, no running animations and no accessibility tree.

## Setup

| Item | Value |
|---|---|
| Date | 2026-10-03 to 2026-10-04 |
| Engine | Chromium 153.0.8010.0, headless (`HeadlessChrome/153.0.8010.0`), the binary shipped by the `@sparticuz/chromium` 153.0.0 npm package, run through `CHROMIUM_PATH` with `--no-sandbox --disable-gpu` |
| Runner | `@playwright/test` 1.63.0 |
| Scanner | axe-core 4.13.0 (read from the engine at run time, recorded on each axe test as an `axe-core` annotation), through `@axe-core/playwright` 4.13.0, tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` |
| Pages | one fixture per component in `e2e/fixtures/`, server-rendered with `renderToString` and hydrated in the browser (React 19.3.0, development build, StrictMode) |
| Viewport | 1280 by 720, locale `en-US`, timezone UTC, light scheme (dark scheme for one axe pass) |
| Target | WCAG 2.2 level AA, the target the library's READMEs already cite |

Playwright's own browser download host is blocked in the environment where
this pass ran, hence the substitute binary. The harness runs unchanged with a
normally installed Playwright Chromium; that path was not exercised here.

Every test also fails on any console error or warning and any uncaught page
error, so the pass doubles as a console audit: the console stayed clean on
every page, including no hydration mismatch.

## Results

`npm run test:browser`: 45 tests, 45 passed, on two consecutive full runs
before the docs were written, and again on the final run before push. No
retries are configured, and no test waits for a fixed duration; time-based
checks wait for animation frames.

### Per component

| Component | Checked in the browser | Observed |
|---|---|---|
| `StackedCards` | computed `position: sticky`; nothing pinned before scrolling; at the scroll where the deck is fully pinned, card tops at 32, 48, 64 and 80 px (one 16 px step each) and the last card on top; Tab forward through the four card links, and Shift+Tab back up while every earlier link sits under a later card, each focused link checked with `elementFromPoint` at its centre and four inset corners | pins and overlaps as designed; every focused link 5 of 5 points visible (WCAG 2.4.11, and the stricter 2.4.12). With the focus raise removed, the same check sees 0 of 5: the check can fail |
| `Marquee` | the track's `getAnimations()`: one animation, `running`, `currentTime` advancing; the toggle sets `aria-pressed` and the animation to `paused` with `currentTime` frozen over 10 frames, then `running` again; pause on hover and resume on leave; Tab order before link, each item once (the duplicate is drawn but out of the tree and the tab order), then the toggle, then the next link; every focused item wholly in view; `direction="right"` covered by a second strip | all as designed after the fix below |
| `GradientBackdrop` | the field's `getAnimations()`: `running` and advancing; the toggle pauses (time frozen) and resumes; paused when scrolled off screen, running when back; a viewer's pause survives leaving and re-entering the screen; the toggle is the section's first Tab stop, 5 of 5 points visible; the backdrop takes no Tab stop and no hit testing (`elementFromPoint` lands on the section, not the backdrop) | all as designed |
| `Magnetic`, `Tilt` | a real mouse moved to the right edge: inline transform at the edge value (`translate3d(10px, ...)`, `rotateY(8deg)`) and a non-`none` computed transform; moving away clears the inline transform and the computed transform settles at `none`; keyboard focus moves nothing; a real touch drag through CDP `Input.dispatchTouchEvent` (pointer events arrive as `touch`, `touch-action: none` on the area so the browser does not cancel the pointer) moves nothing | all as designed. With the touch guard removed, the touch check fails (`translate3d(8.33px, 0px, 0px)`): the check can fail |
| `Reveal`, `Stagger` | with JavaScript disabled (`javaScriptEnabled: false`): the server HTML alone, every block and item visible, effective opacity 1, no `opacity`, `transform` or `transition` in any style attribute, never hydrated; with JavaScript on: content on screen at load never armed; content off screen armed and hidden at opacity 0 with no animation running; scrolled into view it enters, `transitionrun` fires for `opacity` and `transform`, it settles at opacity 1 and `transform: none`, and nothing is left running; Stagger delays 0, 80, 160, 240 ms in source order | as designed after the fix below |
| `Counter` | Playwright's accessibility snapshot of the paragraph (`ariaSnapshot`) before the count (display rewound to `0`), during it (display on an intermediate value, `data-done="false"`) and after it (display `12,000`) | the snapshot was exactly `- paragraph: 12,000 customers` at all three moments: only the final value is exposed |
| `Dialog` | open from the keyboard; focus moves inside; six Tabs and six Shift+Tabs all stay inside, visiting the field, Cancel and Send invite; the page behind leaves the accessibility tree while open; Escape closes and focus returns to the trigger; Cancel closes and returns focus too; accessible name and description | all as designed (the behaviour is Radix's, wrapped) |
| `Tooltip` | Tab to the trigger opens it; `role="tooltip"` with the text, and the trigger's accessible description is that text; Escape closes it and focus stays on the trigger; Tab onward opens nothing; hover opens it above the trigger, inside the viewport; a stepped pointer path away closes it | all as designed. A single jump of the pointer far away leaves it open: Radix's hoverable-content grace area needs a real pointer path, which a person always produces; this is the base's design, not a defect |

### Reduced motion

A context with `reducedMotion: "reduce"` (confirmed by `matchMedia` in the
page): Marquee one copy, wrapped, nothing clipped, no toggle; GradientBackdrop
still, no toggle; Reveal and Stagger never armed, everything at opacity 1;
Counter final from the start; StackedCards `position: static`; Magnetic and
Tilt not enabled and unmoved by a real mouse. After scrolling each page top to
bottom, `document.getAnimations()` was empty on every page: no Web Animation
and no CSS transition ran.

### axe-core

No violations on any of the ten fixtures at rest, on the dialog open, on the
tooltip open, and on all ten again in one context with reduced motion and the
dark scheme. A scan is the floor of this pass, not its verdict; the keyboard
and focus checks above are.

## Defects found and fixed

1. **Marquee: a focused item could be partly or wholly out of view (WCAG
   2.4.7, 2.4.11).** Focus pauses the loop wherever it is, inside a clipped
   viewport. Observed: the first item 39 to 72 px out of the left edge, the
   first item of a right-running strip with 0 of 5 points visible, and on a
   wholly hidden item Chrome scrolled the clipped viewport (`scrollLeft` 797),
   an offset that outlived the focus and shifted the loop's seam. Fix
   (`marquee.tsx`): on focus, in the next frame, the viewport scroll is reset
   and the animation is seeked to the nearest position that shows the whole
   item, so the loop resumes without a jump. Test: `e2e/marquee.e2e.ts`, both
   strips; seen failing before the fix and passing after.
2. **Reveal and Stagger: armed content faded out before fading in.** The
   transition was set in the same style change as the hidden state, so
   arming played the server HTML fading out over the motion duration
   (observed at opacity 0.12 and 0.02 part way). Off screen it is wasted
   work; on a restored scroll position it is a visible flash. Fix
   (`reveal.tsx`, `stagger.tsx`): the transition and its delay belong to the
   shown state only, so arming hides at once and the entrance still
   transitions (`transitionrun` observed). Tests: new and updated unit tests
   in `reveal.test.tsx` and `stagger.test.tsx` (seen failing before the fix),
   and `e2e/entrance.e2e.ts`.

## Not covered, needs a person or another engine

Stated plainly, because none of the following was done:

- **No screen reader was used.** The accessibility tree was read through
  Playwright's snapshot, which is Chromium's tree, not what NVDA, JAWS,
  VoiceOver or TalkBack announce. In particular, whether a reader announces
  the Counter's visually hidden final value once, the Marquee toggle's
  pressed state, the Dialog's description, and the StackedCards list count,
  is unverified. A person with at least one real screen reader must run it.
- **Firefox and WebKit were not run.** Only Chromium. Sticky positioning
  inside a flex column, `inert`, `color-mix()`, Web Animations seeking and
  touch pointer events all deserve a run in Firefox and in WebKit (Safari on
  macOS and iOS), where list semantics with `list-style: none` also differ.
- **No real touch device and no real pointer hardware.** Touch was
  synthesised through the DevTools protocol, and hover through Playwright's
  mouse.
- **No visual judgement.** No screenshot baselines, no check of contrast on
  the rendered gradient behind real content (axe skips text over background
  gradients it cannot resolve), no zoom to 200 percent or reflow at 320 px.
- **Headful rendering and GPU compositing** were not exercised; the binary
  ran headless with the GPU disabled.
- **The normally installed Playwright Chromium** path of the harness was not
  run here, only the `CHROMIUM_PATH` path.
