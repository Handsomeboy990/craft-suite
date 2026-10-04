import { useRef, type CSSProperties, type ReactNode } from "react";
import { useEntrance } from "../../hooks/use-entrance";

/*
 * Reveal.
 *
 * Fades and lifts its children into place the first time they scroll into
 * view, using IntersectionObserver. It is the original of the Reveal component
 * the two site examples each copy today; the motion layer owns it once.
 *
 * Visible by default. The server render, a page without JavaScript, a crawler
 * and the first client render all get the content plainly, with no hiding
 * style. The entrance is armed only on the client, by `useEntrance`, once it
 * has confirmed IntersectionObserver, no reduced motion, and that the content
 * is not already on screen; only armed content is hidden until it is seen.
 *
 * Reduced motion is a hard floor, three ways: when the viewer asks for reduced
 * motion, when IntersectionObserver is absent (old browser), and through the
 * motion tokens, which are zero under the same preference. In every one of
 * those cases the content is shown at once, with no transition, never hidden.
 * Motion only ever adds to a result that is already there.
 */

export interface RevealProps {
  children: ReactNode;
  /** Delay before the transition starts, in milliseconds. */
  delayMs?: number;
  className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { armed, shown } = useEntrance(ref, 0.15);

  // The transition belongs to the entrance only. Arming hides the content at
  // once; were the transition already set, the server HTML would visibly fade
  // out first, on screen whenever the browser restores a scroll position.
  const style: CSSProperties = !armed
    ? {}
    : shown
      ? {
          opacity: 1,
          transform: "none",
          transition:
            "opacity var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease), transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
          transitionDelay: `${delayMs}ms`,
        }
      : { opacity: 0, transform: "translateY(1rem)" };

  return (
    <div
      ref={ref}
      data-cu="reveal"
      data-armed={armed}
      data-shown={shown}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
