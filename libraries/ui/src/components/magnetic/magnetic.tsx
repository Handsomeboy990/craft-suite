import type { CSSProperties, ReactNode } from "react";
import { usePointerFollow } from "../../hooks/use-pointer-follow";

/*
 * Magnetic.
 *
 * Draws one element a few pixels toward the pointer while the pointer is over
 * it, and lets it settle back when the pointer leaves: a call to action that
 * acknowledges the cursor. For a single element, never a whole grid.
 *
 * Pointer only, transform only, one write per animation frame, through the
 * shared `usePointerFollow`. Touch and keyboard focus move nothing; a focused
 * child keeps its normal focus ring. Under reduced motion, or where
 * requestAnimationFrame is absent, no handler is attached and the element
 * stays exactly where the layout put it.
 */

export interface MagneticProps {
  /** The single element to draw toward the pointer, typically a link or a button. */
  children: ReactNode;
  /** Largest offset, in pixels, reached at the edge of the element. */
  strength?: number;
  className?: string;
}

const areaStyle: CSSProperties = { display: "inline-block" };

const targetStyle: CSSProperties = {
  display: "inline-block",
  transition: "transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
};

export function Magnetic({ children, strength = 8, className }: MagneticProps) {
  const { areaRef, targetRef, enabled, handlers } = usePointerFollow<HTMLSpanElement>(
    (x, y) => `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px, 0)`,
  );

  return (
    <span
      ref={areaRef}
      data-cu="magnetic"
      data-enabled={enabled}
      className={className}
      style={areaStyle}
      {...handlers}
    >
      <span ref={targetRef} data-cu="magnetic-target" style={enabled ? targetStyle : areaStyle}>
        {children}
      </span>
    </span>
  );
}
