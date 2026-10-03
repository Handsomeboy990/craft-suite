import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * GradientBackdrop.
 *
 * A soft field of colour that drifts very slowly behind a section, with an
 * optional fine grain over it. Decoration and nothing more: it carries no
 * information, so it is aria-hidden, takes no pointer events and is never
 * focusable.
 *
 * It costs no layout. The backdrop is absolutely positioned to fill its
 * nearest positioned ancestor, contained (`contain: strict`) so nothing inside
 * it can lay out or paint the page around it, and the drift is a single Web
 * Animations API animation of `transform` on one oversized layer, which the
 * compositor runs without layout or paint. The grain is a static SVG noise
 * tile, painted once. The animation pauses while the backdrop is off screen.
 *
 * Motion only ever adds to a result that is already there. The server render,
 * the first render, a browser without the Web Animations API and a viewer who
 * asked for reduced motion all get the same still gradient at rest.
 *
 * The drift starts by itself, runs in parallel with the content and never
 * ends, so WCAG 2.2.2 asks for a way to pause it; reduced motion alone is not
 * that mechanism, since not every viewer can or knows to set it. While the
 * drift runs, a toggle button, with a stable name and `aria-pressed` for its
 * state as on Marquee, pauses and resumes it. It is rendered beside the
 * aria-hidden root, never inside it, so it stays reachable and announced.
 */

export interface GradientBackdropProps {
  /** CSS background layers of the field. Defaults to two soft blooms from the colour tokens. */
  background?: string;
  /** Time for one drift, out and back counts as two, in milliseconds. */
  durationMs?: number;
  /** Lay a static grain over the gradient. */
  grain?: boolean;
  /** Opacity of the grain, from 0 to 1. */
  grainOpacity?: number;
  /** Render the pause and resume button while the drift runs. On by default; turn off only when the page offers another way to stop it. */
  showControl?: boolean;
  /** Text of the control. It stays the same in both states; `aria-pressed` carries the state. */
  pauseLabel?: string;
  className?: string;
}

const DEFAULT_BACKGROUND = [
  "radial-gradient(45% 55% at 25% 30%, color-mix(in srgb, var(--cu-color-accent, #3056d3) 32%, transparent), transparent 70%)",
  "radial-gradient(50% 50% at 75% 70%, color-mix(in srgb, var(--cu-color-muted, #5a6472) 22%, transparent), transparent 70%)",
].join(", ");

// A fractal-noise tile, written here; static, so it is painted once and tiled.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const rootStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
  contain: "strict",
};

const layerStyle: CSSProperties = { position: "absolute" };

// The top end corner, so the control is first in the section's focus order
// and first where the eye starts; above later positioned content.
const controlStyle: CSSProperties = {
  position: "absolute",
  insetBlockStart: "var(--cu-space-2, 0.5rem)",
  insetInlineEnd: "var(--cu-space-2, 0.5rem)",
  zIndex: 1,
  padding: "var(--cu-space-1, 0.25rem) var(--cu-space-3, 0.75rem)",
  font: "var(--cu-text-sm, 0.833rem)/1.5 var(--cu-font-sans, system-ui, sans-serif)",
  color: "var(--cu-color-text, #15181c)",
  background: "var(--cu-color-surface, #f6f7f9)",
  border: "1px solid var(--cu-color-border, #d9dee5)",
  borderRadius: "var(--cu-radius-sm, 0.25rem)",
  cursor: "pointer",
};

export function GradientBackdrop({
  background = DEFAULT_BACKGROUND,
  durationMs = 40000,
  grain = true,
  grainOpacity = 0.06,
  showControl = true,
  pauseLabel = "Pause motion",
  className,
}: GradientBackdropProps) {
  const reduced = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const [supported, setSupported] = useState(false);
  const [offScreen, setOffScreen] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const animated = supported && !reduced && durationMs > 0;
  const paused = offScreen || userPaused;

  // Detect the platform once mounted; until then the still gradient stands.
  useEffect(() => {
    setSupported(typeof Element !== "undefined" && typeof Element.prototype.animate === "function");
  }, []);

  useEffect(() => {
    if (!animated) return;
    const field = fieldRef.current;
    if (!field || typeof field.animate !== "function") return;
    const animation = field.animate(
      [
        { transform: "translate3d(-4%, -3%, 0) rotate(-4deg) scale(1)" },
        { transform: "translate3d(4%, 3%, 0) rotate(4deg) scale(1.06)" },
      ],
      {
        duration: durationMs,
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      },
    );
    animationRef.current = animation;
    // Off screen, nothing is drawn; stop the clock too.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        setOffScreen(!entries.some((entry) => entry.isIntersecting));
      });
      observer.observe(field.parentElement ?? field);
    }
    return () => {
      observer?.disconnect();
      animation.cancel();
      animationRef.current = null;
    };
  }, [animated, durationMs]);

  // Runs after the effect above, so a recreated animation inherits the pause.
  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (paused) animation.pause();
    else animation.play();
  }, [paused, animated, durationMs]);

  return (
    <>
      <div
        aria-hidden="true"
        data-cu="gradient-backdrop"
        data-animated={animated}
        data-paused={animated && paused}
        className={className}
        style={rootStyle}
      >
        <div
          ref={fieldRef}
          data-cu="gradient-backdrop-field"
          style={{ ...layerStyle, inset: "-20%", background }}
        />
        {grain ? (
          <div
            data-cu="gradient-backdrop-grain"
            style={{ ...layerStyle, inset: 0, backgroundImage: GRAIN, opacity: grainOpacity }}
          />
        ) : null}
      </div>
      {animated && showControl ? (
        <button
          type="button"
          data-cu="gradient-backdrop-control"
          aria-pressed={userPaused}
          onClick={() => setUserPaused((value) => !value)}
          style={controlStyle}
        >
          {pauseLabel}
        </button>
      ) : null}
    </>
  );
}
