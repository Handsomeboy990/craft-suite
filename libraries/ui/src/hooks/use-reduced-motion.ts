import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the viewer asked for reduced motion.
 *
 * Starts false so server and first client render agree, then syncs to the
 * media query and tracks changes. Safe where `window` or `matchMedia` is
 * absent (server, old test env): it stays false and the caller shows a static
 * result rather than crashing. Motion components use this as the hard floor
 * the tokens also enforce: when it is true, they do not animate.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

/**
 * The same preference read once, synchronously, for code that must decide
 * before the hook above has synced (a layout effect). False where `window` or
 * `matchMedia` is absent.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}
