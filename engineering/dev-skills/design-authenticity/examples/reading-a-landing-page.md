# Example: reading a generated landing page

A startup landing page. The team likes it. It was assembled quickly and looks,
in their words, modern and clean. The skill reads the rendered page.

## What is present

```
Hero            violet-to-black diagonal gradient, a blurred purple orb top
                right, a heading reading "Ship faster with AI" with a sparkle
                emoji, Space Grotesk throughout
Features        a bento grid of six rounded cards, each on the same soft drop
                shadow, each lifting on hover
Social proof    three testimonials, "Sarah K., Founder", "Mike T., CTO", no
                company, no link, no photo that resolves
Pricing         three tiers, Starter, Pro, Enterprise, all "Contact us", on a
                product with no stated price
Motion          every card, button and link has a hover transition; no
                prefers-reduced-motion handling
Product         nothing. No screenshot, no demo, no image of the thing itself
```

## The finding

```
Visual cluster: high. Seven tells, none with a stated reason.
  - the violet-to-black gradient, the blurred orb, the bento grid, the
    uniform radius, the uniform drop shadow, the sparkle emoji heading, and
    Space Grotesk are the default look of a generated page. Any one could be
    intended; all seven together, with no identity behind them, are the
    verdict. If the gradient is meant to evoke something for this product,
    name it; if not, choose a ground that fits the brand once the brand
    exists.

Content tells, raised regardless of the cluster and more serious than it:
  - the three testimonials name people with no company, no link and no
    resolving photo. If these people did not consent to a real quote, this is
    a fabricated endorsement, handed to implementation-integrity as a
    truthfulness defect, not a design note. Remove them or make them real.
  - the pricing section is a template three-tier layout on a product with no
    pricing. Either state real pricing or remove the section; a Contact us in
    every column is the template showing through.
  - the page never shows the product. It sells shipping faster and displays
    nothing that ships. Add a real screenshot or a demo, or the page has no
    evidence for its claim.

Accessibility, separate from taste:
  - every interactive element animates on hover and nothing honours
    prefers-reduced-motion. This fails on accessibility grounds regardless of
    the visual assessment. Gate the motion behind the preference.
```

## What the skill did not say

It did not say rounded corners are wrong, or that Space Grotesk is a bad font,
or that gradients are forbidden. It said these choices look inherited rather
than made, and asked the team to make them or replace them. The two findings
that were not negotiable were the fabricated testimonials, because they are a
lie on the page, and the missing reduced-motion handling, because it is an
accessibility failure. The rest is the team's to decide, once the product has
an identity to decide from.
