import { Children, useRef, type CSSProperties, type ReactNode } from "react";
import { useEntrance } from "../../hooks/use-entrance";

/*
 * Stagger.
 *
 * Brings a group of items into place one after another, the first time the
 * group scrolls into view: a row of features, a short list of steps. It is
 * Reveal's motion applied per item with a small, growing delay, and it shares
 * Reveal's in-view logic through `useInViewOnce` rather than repeating it. One
 * observer watches the group, not one per item.
 *
 * Visible by default, on the same contract as Reveal (`useEntrance`): the
 * server render, a page without JavaScript, a crawler and the first client
 * render get every item plainly. Items are hidden until seen only once the
 * client has confirmed IntersectionObserver, no reduced motion, and that the
 * group is not already on screen.
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
  const ref = useRef<HTMLElement | null>(null);
  const { armed, shown } = useEntrance(ref, 0.15);
  const Item = Group === "div" ? "div" : "li";

  // As in Reveal, the transition belongs to the entrance only: arming hides the
  // items at once, so the server HTML never visibly fades out first.
  const itemStyle = (index: number): CSSProperties =>
    !armed
      ? {}
      : shown
        ? {
            opacity: 1,
            transform: "none",
            transition:
              "opacity var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease), transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
            transitionDelay: `${delayMs + Math.min(index, STAGGER_MAX_STEPS) * stepMs}ms`,
          }
        : { opacity: 0, transform: "translateY(0.75rem)" };

  const items = Children.toArray(children);

  return (
    <Group
      ref={ref as never}
      data-cu="stagger"
      data-armed={armed}
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
