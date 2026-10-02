import { useEffect, useState, type RefObject } from "react";

export interface InViewOnceOptions {
  /** Fraction of the element that must be visible to count as seen. */
  threshold?: number;
  /** Report seen at once and observe nothing, for example under reduced motion. */
  skip?: boolean;
}

/**
 * Whether the element has been seen at least once.
 *
 * The in-view logic the scroll-triggered motion primitives share (`Reveal`,
 * `Stagger`). It flips to true the first time the element intersects the
 * viewport, then disconnects; it never flips back. It reports true at once,
 * and observes nothing, when `skip` is set or `IntersectionObserver` is absent
 * (server render, old browser), so a caller that hides content until it is
 * seen can never leave it hidden.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  { threshold = 0.15, skip = false }: InViewOnceOptions = {},
): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (skip || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, skip, threshold]);

  return seen;
}
