import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { useInViewOnce } from "./use-in-view-once";
import { prefersReducedMotion, useReducedMotion } from "./use-reduced-motion";

// useLayoutEffect on the client, so arming happens before the browser paints;
// useEffect on the server, where neither runs and React 18 would warn.
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface Entrance {
  /**
   * Whether the entrance applies at all: mounted on a client with
   * IntersectionObserver, no reduced motion, and off screen when mounted.
   * While false the caller renders its content plainly, with no hiding style.
   */
  armed: boolean;
  /** Whether the element has been seen once (see `useInViewOnce`). */
  shown: boolean;
}

/**
 * The entrance contract `Reveal` and `Stagger` share.
 *
 * Content is visible by default: in the server HTML, to a page without
 * JavaScript, to a crawler, and on the first client render. The entrance is
 * armed, and only then may the caller hide the content until it is seen, once
 * a layout effect on the client has confirmed three things:
 *
 * - `IntersectionObserver` exists, so something will reveal the content;
 * - the viewer has not asked for reduced motion;
 * - the element is not already in the viewport. Content the reader can see at
 *   mount, the server-rendered top of the page above all, is never hidden and
 *   faded back in: that would be a flash, not an entrance.
 *
 * Arming only ever affects content off screen, so it changes nothing the
 * reader sees, and the hiding style is opacity and transform only, so it
 * shifts no layout. A reduced-motion preference that arrives later disarms it.
 */
export function useEntrance(ref: RefObject<Element | null>, threshold = 0.15): Entrance {
  const reduced = useReducedMotion();
  const shown = useInViewOnce(ref, { threshold, skip: reduced });
  const [armed, setArmed] = useState(false);

  useClientLayoutEffect(() => {
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const onScreen = box.bottom > 0 && box.top < window.innerHeight;
    if (!onScreen) setArmed(true);
    // Decided once, at mount: arming later could hide what is already on screen.
  }, []);

  return { armed: armed && !reduced, shown };
}
