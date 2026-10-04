import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

/*
 * Marquee.
 *
 * Scrolls a row of content sideways in a seamless loop: logos, quotes, short
 * claims. The loop is two copies of the content on one track, translated by
 * exactly one copy's width, so the seam never shows. The second copy is a
 * visual echo only: it is aria-hidden and inert, so assistive technology and
 * the keyboard meet the content once.
 *
 * Motion only ever adds to a result that is already there. The first render,
 * the server render, a browser without the Web Animations API and a viewer who
 * asked for reduced motion all get the same static result: one copy, wrapped,
 * every item visible, nothing clipped and nothing moving. The loop is switched
 * on in an effect, only once the platform and the viewer both allow it.
 *
 * Moving content that lasts more than five seconds must be pausable (WCAG
 * 2.2.2). The loop pauses while the pointer is over it or focus is inside it,
 * and a real toggle button, with a stable name and `aria-pressed` for its
 * state, pauses and resumes it for anyone who cannot hover.
 */

export interface MarqueeProps {
  children: ReactNode;
  /** Accessible name of the group, for example "Customers". Required. */
  label: string;
  /** Time for one full loop, in milliseconds. */
  durationMs?: number;
  /** Direction the content travels. */
  direction?: "left" | "right";
  /** Render the pause and resume button. On by default; turn off only when the page offers another way to stop it. */
  showControl?: boolean;
  /** Text of the control. It stays the same in both states; `aria-pressed` carries the state. */
  pauseLabel?: string;
  className?: string;
}

function canAnimate(el: Element | null): el is HTMLElement {
  return !!el && typeof (el as HTMLElement).animate === "function";
}

/*
 * Brings a focused item of the paused loop fully into view (WCAG 2.4.7 and
 * 2.4.11). The loop pauses wherever it happens to be, so without this a
 * focused item can sit half or wholly outside the clipped viewport. Two
 * things are corrected:
 *
 * - the browser's own focus scroll: on a fully hidden item it scrolls the
 *   clipped viewport, and that offset would outlive the focus and shift the
 *   loop's seam. It is reset to zero;
 * - the loop's position: the animation is seeked, not the layout moved, to the
 *   nearest offset that shows the whole item, so the loop resumes from there
 *   without a jump.
 *
 * The track is two copies, each `copy` pixels wide, translated from 0 to
 * -copy (left) or from -copy to 0 (right) over one iteration. Only the first
 * copy is focusable, so its item is shown by an offset within [-copy, 0].
 */
function revealFocused(
  viewport: HTMLElement,
  track: HTMLElement,
  item: HTMLElement,
  animation: Animation,
  direction: "left" | "right",
  durationMs: number,
) {
  viewport.scrollLeft = 0;
  const view = viewport.getBoundingClientRect();
  const trackBox = track.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  const copy = trackBox.width / 2;
  if (copy <= 0 || box.width > view.width) return;
  const offset = trackBox.left - view.left;
  const start = box.left - trackBox.left;
  const lowest = Math.max(-start, -copy);
  const highest = Math.min(view.width - box.width - start, 0);
  const target = Math.min(Math.max(offset, lowest), highest);
  if (Math.abs(target - offset) < 0.5) return;
  const progress = direction === "left" ? -target / copy : (target + copy) / copy;
  const time = Number(animation.currentTime ?? 0);
  const iterationStart = time - (time % durationMs);
  // Stay inside the iteration: its very end is the next one's start, the other offset.
  animation.currentTime = iterationStart + Math.min(Math.max(progress, 0), 1 - 1e-6) * durationMs;
}

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "nowrap",
  flexShrink: 0,
  alignItems: "center",
  gap: "var(--cu-space-8, 2rem)",
  paddingInlineEnd: "var(--cu-space-8, 2rem)",
  margin: 0,
};

const controlStyle: CSSProperties = {
  marginTop: "var(--cu-space-2, 0.5rem)",
  padding: "var(--cu-space-1, 0.25rem) var(--cu-space-3, 0.75rem)",
  font: "var(--cu-text-sm, 0.833rem)/1.5 var(--cu-font-sans, system-ui, sans-serif)",
  color: "var(--cu-color-text, #15181c)",
  background: "var(--cu-color-surface, #f6f7f9)",
  border: "1px solid var(--cu-color-border, #d9dee5)",
  borderRadius: "var(--cu-radius-sm, 0.25rem)",
  cursor: "pointer",
};

export function Marquee({
  children,
  label,
  durationMs = 30000,
  direction = "left",
  showControl = true,
  pauseLabel = "Pause motion",
  className,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const [supported, setSupported] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const animated = supported && !reduced;
  const paused = hovered || focused || userPaused;

  // Detect the platform once mounted; until then the static result stands.
  useEffect(() => {
    setSupported(typeof Element !== "undefined" && typeof Element.prototype.animate === "function");
  }, []);

  useEffect(() => {
    if (!animated) return;
    const track = trackRef.current;
    if (!canAnimate(track)) return;
    const frames =
      direction === "left"
        ? [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }]
        : [{ transform: "translateX(-50%)" }, { transform: "translateX(0)" }];
    const animation = track.animate(frames, {
      duration: durationMs,
      iterations: Infinity,
      easing: "linear",
    });
    animationRef.current = animation;
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [animated, direction, durationMs]);

  // Runs after the effect above, so a recreated animation inherits the pause.
  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (paused) animation.pause();
    else animation.play();
  }, [paused, animated, direction, durationMs]);

  const viewportStyle: CSSProperties = animated ? { overflow: "hidden", maxWidth: "100%" } : {};

  const trackStyle: CSSProperties = animated
    ? { display: "flex", width: "max-content", willChange: "transform" }
    : {};

  const staticRowStyle: CSSProperties = animated
    ? rowStyle
    : { ...rowStyle, flexWrap: "wrap", flexShrink: 1, paddingInlineEnd: 0 };

  return (
    <div
      role="group"
      aria-label={label}
      data-cu="marquee"
      data-animated={animated}
      data-paused={animated && paused}
      className={className}
    >
      <div
        data-cu="marquee-viewport"
        style={viewportStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(event) => {
          setFocused(true);
          const viewport = event.currentTarget;
          const item = event.target;
          // After the browser's own focus scroll, and after the pause has applied.
          requestAnimationFrame(() => {
            const animation = animationRef.current;
            const track = trackRef.current;
            if (!animation || !track || document.activeElement !== item) return;
            revealFocused(viewport, track, item, animation, direction, durationMs);
          });
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <div ref={trackRef} data-cu="marquee-track" style={trackStyle}>
          <div data-cu="marquee-content" style={staticRowStyle}>
            {children}
          </div>
          {animated ? (
            <div data-cu="marquee-content" aria-hidden="true" inert style={rowStyle}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
      {animated && showControl ? (
        <button
          type="button"
          data-cu="marquee-control"
          aria-pressed={userPaused}
          onClick={() => setUserPaused((value) => !value)}
          style={controlStyle}
        >
          {pauseLabel}
        </button>
      ) : null}
    </div>
  );
}
