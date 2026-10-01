import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * Reveal.
 *
 * Fades and lifts its children into place the first time they scroll into
 * view, using IntersectionObserver. It is the original of the Reveal component
 * the two site examples each copy today; the motion layer owns it once.
 *
 * Reduced motion is a hard floor, three ways: when the viewer asks for reduced
 * motion, when IntersectionObserver is absent (server render, old browser),
 * and through the motion tokens, which are zero under the same preference. In
 * every one of those cases the content is shown at once, with no transition,
 * never hidden. Motion only ever adds to a result that is already there.
 */

export interface RevealProps {
  children: ReactNode;
  /** Delay before the transition starts, in milliseconds. */
  delayMs?: number;
  className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const animated = !reduced;
  const style: CSSProperties = animated
    ? {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(1rem)",
        transition:
          "opacity var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease), transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
        transitionDelay: `${delayMs}ms`,
      }
    : {};

  return (
    <div ref={ref} data-cu="reveal" data-shown={shown} className={className} style={style}>
      {children}
    </div>
  );
}
