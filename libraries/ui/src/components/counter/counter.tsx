import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * Counter.
 *
 * Counts a figure up (or down) to its value the first time it scrolls into
 * view: the "12,000 customers" line of a landing page.
 *
 * The figure is the content, so it is never withheld. The server render, the
 * first render and every fallback show the final value. Only when the
 * platform can animate (IntersectionObserver and requestAnimationFrame
 * present) and the viewer has not asked for reduced motion does the counter
 * rewind to its starting value, before paint, and count up once it is seen.
 *
 * Assistive technology reads the final value and only the final value. The
 * moving digits are aria-hidden; a visually hidden copy carries the real
 * figure from the first render, so a screen reader never hears the
 * intermediate numbers and never needs a live region to catch up.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

export interface CounterProps {
  /** The figure to land on. */
  value: number;
  /** Where the count starts. */
  from?: number;
  /** Length of the count, in milliseconds. */
  durationMs?: number;
  /** Digits after the decimal point, used by the default formatter. */
  decimals?: number;
  /** Locale for the default formatter; the runtime's locale when omitted. */
  locale?: string;
  /** Custom formatter, for currency, units or a suffix. Applied to every frame and to the final value. */
  format?: (value: number) => string;
  className?: string;
}

// The hook syncs after mount; read the preference directly too, so a viewer
// who asked for reduced motion never sees the figure rewind, even for a frame.
function prefersReduced(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY).matches
    : false;
}

function canAnimate(): boolean {
  return (
    typeof IntersectionObserver !== "undefined" &&
    typeof requestAnimationFrame === "function" &&
    typeof cancelAnimationFrame === "function"
  );
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// useLayoutEffect warns in some server renderers; it is only needed in the browser.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Counter({
  value,
  from = 0,
  durationMs = 1200,
  decimals = 0,
  locale,
  format,
  className,
}: CounterProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [current, setCurrent] = useState(value);

  const formatter = useMemo(() => {
    if (format) return format;
    const nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return (n: number) => nf.format(n);
  }, [format, locale, decimals]);

  useBrowserLayoutEffect(() => {
    if (reduced || prefersReduced() || !canAnimate() || durationMs <= 0 || from === value) {
      setCurrent(value);
      return;
    }
    const el = ref.current;
    if (!el) {
      setCurrent(value);
      return;
    }
    setCurrent(from);
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      setCurrent(t >= 1 ? value : from + (value - from) * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced, value, from, durationMs]);

  const finalText = formatter(value);
  const done = current === value;

  return (
    <span
      ref={ref}
      data-cu="counter"
      data-done={done}
      className={className}
      style={{ position: "relative" }}
    >
      <span
        data-cu="counter-display"
        aria-hidden="true"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {done ? finalText : formatter(current)}
      </span>
      <span data-cu="counter-value" style={srOnly}>
        {finalText}
      </span>
    </span>
  );
}
