import { Children, useRef, type CSSProperties, type ReactNode } from "react";
import { useInViewOnce } from "../../hooks/use-in-view-once";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * Stagger.
 *
 * Brings a group of items into place one after another, the first time the
 * group scrolls into view: a row of features, a short list of steps. It is
 * Reveal's motion applied per item with a small, growing delay, and it shares
 * Reveal's in-view logic through `useInViewOnce` rather than repeating it. One
 * observer watches the group, not one per item.
 *
 * Reduced motion is the same hard floor as Reveal's: when the viewer asks for
 * reduced motion, or IntersectionObserver is absent, every item is shown at
 * once with no transition and no delay. The items stay in source order, so
 * reading order and focus order are the order the author wrote.
 */

export interface StaggerProps {
  /** The items. Each direct child becomes one staggered item. */
  children: ReactNode;
  /** Delay between one item and the next, in milliseconds. */
  stepMs?: number;
  /** Delay before the first item starts, in milliseconds. */
  delayMs?: number;
  /** Element of the group. A list renders each item as a list item. */
  as?: "div" | "ul" | "ol";
  className?: string;
  /** Passed to every item wrapper. */
  itemClassName?: string;
}

/** Items past this index share its delay, so a long group never drags. */
export const STAGGER_MAX_STEPS = 10;

const listReset: CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

export function Stagger({
  children,
  stepMs = 60,
  delayMs = 0,
  as: Group = "div",
  className,
  itemClassName,
}: StaggerProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const shown = useInViewOnce(ref, { threshold: 0.15, skip: reduced });
  const Item = Group === "div" ? "div" : "li";
  const animated = !reduced;

  const itemStyle = (index: number): CSSProperties =>
    animated
      ? {
          opacity: shown ? 1 : 0,
          transform: shown ? "none" : "translateY(0.75rem)",
          transition:
            "opacity var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease), transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
          transitionDelay: `${delayMs + Math.min(index, STAGGER_MAX_STEPS) * stepMs}ms`,
        }
      : {};

  const items = Children.toArray(children);

  return (
    <Group
      ref={ref as never}
      data-cu="stagger"
      data-shown={shown}
      className={className}
      style={Group === "div" ? undefined : listReset}
      // Safari drops list semantics when list-style is none; restate it.
      role={Group === "div" ? undefined : "list"}
    >
      {items.map((child, index) => (
        <Item
          // Children.toArray gives every child a stable key.
          key={(child as { key?: string | null }).key ?? index}
          data-cu="stagger-item"
          className={itemClassName}
          style={itemStyle(index)}
        >
          {child}
        </Item>
      ))}
    </Group>
  );
}
