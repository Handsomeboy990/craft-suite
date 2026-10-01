import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/*
 * usePointerFollow.
 *
 * The pointer logic `Magnetic` and `Tilt` share. It maps the pointer's place
 * over an area to x and y in [-1, 1] (centre is 0), and writes the transform a
 * caller derives from them onto a separate target element, directly on its
 * style, so a move never re-renders React. The area is never transformed
 * itself, so its box stays a stable frame of reference and hit area.
 *
 * - Pointer only. Touch is ignored, and focus adds nothing; the element keeps
 *   its normal focus ring and nothing moves for a keyboard user.
 * - At most one write per frame: moves between frames only update the latest
 *   coordinates, and one requestAnimationFrame reads the area's box and writes
 *   the transform.
 * - Transform only, and `will-change` only while the pointer is over the area.
 * - Resets on leave and on cancel, and cleans up its frame on unmount.
 * - Off entirely, no handlers attached, under reduced motion or where
 *   requestAnimationFrame is absent: the element simply stays where it is.
 */

export interface PointerFollow<E extends HTMLElement> {
  areaRef: RefObject<E | null>;
  targetRef: RefObject<E | null>;
  /** Whether the effect is live: platform support and no reduced motion. */
  enabled: boolean;
  /** Spread onto the area. Empty when the effect is off. */
  handlers: {
    onPointerMove?: (event: ReactPointerEvent<E>) => void;
    onPointerLeave?: () => void;
    onPointerCancel?: () => void;
  };
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

export function usePointerFollow<E extends HTMLElement = HTMLElement>(
  toTransform: (x: number, y: number) => string,
): PointerFollow<E> {
  const reduced = useReducedMotion();
  const areaRef = useRef<E | null>(null);
  const targetRef = useRef<E | null>(null);
  const frame = useRef(0);
  const latest = useRef<{ x: number; y: number } | null>(null);
  const transform = useRef(toTransform);
  transform.current = toTransform;
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function",
    );
  }, []);

  const enabled = supported && !reduced;

  const reset = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    latest.current = null;
    const target = targetRef.current;
    if (target) {
      target.style.transform = "";
      target.style.willChange = "";
    }
  };

  // Going off (reduced motion switched on) or unmounting leaves no residue.
  useEffect(() => {
    if (!enabled) return;
    return reset;
  }, [enabled]);

  if (!enabled) return { areaRef, targetRef, enabled, handlers: {} };

  const onPointerMove = (event: ReactPointerEvent<E>) => {
    if (event.pointerType === "touch") return;
    latest.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    const target = targetRef.current;
    if (target) target.style.willChange = "transform";
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const area = areaRef.current;
      const point = latest.current;
      if (!area || !point || !targetRef.current) return;
      const box = area.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const x = clamp(((point.x - box.left) / box.width) * 2 - 1);
      const y = clamp(((point.y - box.top) / box.height) * 2 - 1);
      targetRef.current.style.transform = transform.current(x, y);
    });
  };

  return {
    areaRef,
    targetRef,
    enabled,
    handlers: { onPointerMove, onPointerLeave: reset, onPointerCancel: reset },
  };
}
