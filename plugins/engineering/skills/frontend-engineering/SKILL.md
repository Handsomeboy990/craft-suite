---
name: frontend-engineering
description: Builds client side features to production standard: component boundaries, state placement, data fetching, forms, the five required UI states, responsive layout, accessibility, rendering performance, animation and internationalisation. Use for any page, component, form or client behaviour.
license: MIT
metadata:
  category: dev-skills
  version: 1.1.0
  depends_on: [engineering-core, project-exploration, ui-ux-engineering]
  outputs: [components, client-state, ui-states, accessibility-notes]
---

# Frontend Engineering

Frontend work is not writing markup. It is deciding where state lives, what
the user sees while waiting, what they see when it fails, and what happens on
a narrow screen with a keyboard and a screen reader.

A feature whose only implemented state is the successful one is not finished.

## 1. Before writing a component

Read and answer, from the repository:

```
Framework and version, rendering model, routing model
Component convention: file placement, naming, export style
Styling system: tokens, utility classes, css modules, styled components
Design system: which components already exist, verified by reading them
State libraries in use, and what each is used for
Data fetching pattern, verified on two existing screens
Form pattern and validation library
Localisation setup, or its absence
```

Building a button in a project that has a button is a defect. Check first.

## 2. The five states

Every view that touches data implements all five. No exceptions, and no
promises to add them later.

| State | Requirement |
|---|---|
| loading | a skeleton or an indicator that does not shift layout on resolve |
| empty | an explanation and, where it applies, the action that fills it |
| error | what failed, whether it is retryable, and the retry control |
| partial | what to do when some of the data arrived and some did not |
| success | the data, with the layout stable across content lengths |

The layout must not jump between states. Reserve the space.

## 3. State placement

Decide once, in this order. The first that fits wins.

1. **Derived**: computable from existing state. Do not store it.
2. **Local**: used by one component. `useState` or the framework equivalent.
3. **Lifted**: used by a parent and its children. One owner, passed down.
4. **URL**: the user should be able to reload, share or bookmark it. Filters,
   tabs, pagination, search terms, open modals with their own address.
5. **Server cache**: it came from the server. It belongs to the data layer,
   not to a global store.
6. **Global client**: genuinely cross cutting, such as theme or a session
   snapshot. This is the rarest case, not the default.

Two defects follow from getting this wrong: server data copied into a global
store, which then goes stale, and filter state kept in memory, which loses the
user's context on reload.

## 4. Data fetching

- Follow the project pattern. Do not introduce a second data layer.
- Fetch at the level that owns the state, not in every leaf.
- Every request has a loading state, an error state and a cancellation or
  ignore path for a stale response.
- Concurrent requests that can resolve out of order must discard the stale
  one.
- Never fetch inside a render body, and never in an effect that lacks a
  dependency guard.
- Pagination or a limit on every list. An endpoint that returns everything is
  a backend defect to raise, not a frontend problem to absorb.
- Optimistic updates require a rollback path, written at the same time.

## 5. Forms

```
Field level validation on blur, form level on submit
The same rules as the server, or a subset, never a superset
Submit disabled while pending, and idempotent against a double click
Errors attached to their field, announced to assistive technology
Focus moved to the first invalid field on failed submit
Values preserved on failure, never cleared
Success feedback that does not disappear before it can be read
Destructive actions confirmed, and confirmations that name the object
```

Client validation is ergonomics. The server rejects independently. See
`input-validation`.

## 6. Accessibility, non negotiable

- Semantic element first: a button is a `button`, not a div with a click
  handler.
- Every interactive element reachable and operable by keyboard, in a logical
  order.
- Focus visible, and never removed without a stronger replacement.
- Focus managed on route change, on dialog open and on dialog close.
- Labels on every input, associated programmatically, not only visually.
- Images have alternative text, or an empty one when decorative.
- Colour is never the only carrier of meaning.
- Contrast meets the standard the project targets, measured, not eyeballed.
- Live regions announce asynchronous changes that matter.
- Dialogs trap focus, close on escape, and restore focus to the trigger.
- Motion respects the reduced motion preference.

Accessibility is applied while building. Retrofitting it costs several times
more and is usually done badly. When the work is an audited surface someone
else built, the findings are worked down with `accessibility-remediation`,
not improvised from this list.

## 7. Responsive

- Design from the narrowest supported width upward.
- Touch targets large enough to hit, with spacing between them.
- No horizontal scrolling of the page. Wide content scrolls inside its own
  container.
- Test the real breakpoints of the project, taken from its configuration.
- Content reflows; it does not get hidden to make a layout fit, unless hiding
  is the deliberate design.

## 8. Rendering performance

- Do not memoise by reflex. Measure, then memoise the component that actually
  re-renders.
- Keep callback and object references stable when they are passed to memoised
  children.
- Keys on lists are stable identifiers, never the array index when the list
  can reorder.
- Long lists are virtualised past the point where the project measures a
  problem.
- Heavy work goes off the main thread or off the render path.
- Images are sized, have dimensions to avoid layout shift, and use the
  project's image pipeline.
- Code splitting at route level, and for large components used rarely.
- Do not import a whole library for one function.

## 9. Animation

Motion is functional: it explains a change of state, a spatial relationship,
or the arrival of new content. Decoration that delays interaction is removed.

```
Duration    150ms to 300ms for most interface transitions
Easing      the project's tokens, not a per component invention
Property    transform and opacity, which do not force layout
Preference  prefers-reduced-motion honoured, no exceptions
Interrupt   an animation can be interrupted by the next user action
```

## 10. Internationalisation

When the project has a localisation system, every user facing string goes
through it. No concatenated sentences from fragments, because word order is
not universal. Dates, numbers and currency use the locale formatter. Layout
tolerates strings that are half again as long.

When the project has no localisation system, strings stay inline and
consistent with the existing ones. Introducing one is an architecture
decision, not a side effect.

## 11. Protocol

1. Read the conventions from section 1.
2. Take the interaction and visual decisions from `ui-ux-engineering`.
3. Decide state placement per section 3 before writing markup.
4. Build the success path.
5. Add the four other states before considering the component done.
6. Apply the accessibility list while building.
7. Verify at the narrowest and widest supported widths.
8. Verify with the keyboard alone.
9. Validate every input that reaches the server.
10. Test: component tests for the states, browser test for the journey.
11. Hand to `code-review-protocol`.

## 12. Auto-critique

Score from 0 to 5: convention fidelity, five states present, correct state
placement, form quality, accessibility, responsive behaviour, rendering cost,
purposeful motion, absence of reinvented components.

Threshold: no axis below 3, average at least 4. A missing error state or a
control unreachable by keyboard is an automatic failure.

## 13. Interfaces

- Upstream: `ui-ux-engineering`, `project-exploration`, `architecture-design`.
- Lateral: `input-validation`, `backend-engineering` for the contract,
  `accessibility-remediation` when the work is an audit's findings.
- Downstream: `testing-quality`, `playwright-automation`,
  `performance-engineering`, `code-review-protocol`.
