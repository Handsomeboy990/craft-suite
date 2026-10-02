import { Children, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * StackedCards.
 *
 * As the page scrolls, each card pins near the top of the viewport and the
 * next one slides up over it, leaving a sliver of every earlier card showing:
 * a deck of cards building as the reader goes. A short sequence of steps or
 * case studies, not a whole page.
 *
 * The technique is CSS alone: every card is `position: sticky` with a top
 * that grows by one step per card, and a z-index that grows with it. The
 * browser does the motion on the compositor; there is no scroll listener and
 * no script runs while scrolling. Where sticky is unsupported the cards fall
 * back to an ordinary stack, which is the same content.
 *
 * The cards stay in source order, so reading order, focus order and the list
 * a screen reader announces are the order the author wrote. A card that takes
 * keyboard focus is raised above the cards that would cover it, so the focused
 * control is never hidden behind a later card (WCAG 2.4.11). Under reduced
 * motion the cards are an ordinary list, nothing pinned and nothing sliding.
 */

export interface StackedCardsProps {
  /** The cards. Each direct child becomes one card of the stack. */
  children: ReactNode;
  /** Accessible name of the list, for example "How it works". */
  label?: string;
  /** Distance from the top of the viewport where the first card pins, a CSS length. */
  top?: string;
  /** Extra offset per card, so earlier cards keep a visible edge, a CSS length. */
  step?: string;
  /** Space between cards while they scroll in, a CSS length. */
  gap?: string;
  className?: string;
  /** Passed to every card wrapper. */
  cardClassName?: string;
}

const listStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
};

export function StackedCards({
  children,
  label,
  top = "var(--cu-space-8, 2rem)",
  step = "var(--cu-space-4, 1rem)",
  gap = "var(--cu-space-8, 2rem)",
  className,
  cardClassName,
}: StackedCardsProps) {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState<number | null>(null);
  const cards = Children.toArray(children);
  const stacked = !reduced;

  const cardStyle = (index: number): CSSProperties =>
    stacked
      ? {
          position: "sticky",
          top: `calc(${top} + ${index} * ${step})`,
          zIndex: focused === index ? cards.length + 1 : index + 1,
        }
      : {};

  return (
    <ul
      data-cu="stacked-cards"
      data-stacked={stacked}
      aria-label={label}
      // Safari drops list semantics when list-style is none; restate it.
      role="list"
      className={className}
      style={{ ...listStyle, gap }}
    >
      {cards.map((card, index) => (
        <li
          key={(card as { key?: string | null }).key ?? index}
          data-cu="stacked-card"
          data-focused={focused === index}
          className={cardClassName}
          style={cardStyle(index)}
          onFocus={() => setFocused(index)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setFocused((value) => (value === index ? null : value));
            }
          }}
        >
          {card}
        </li>
      ))}
    </ul>
  );
}
