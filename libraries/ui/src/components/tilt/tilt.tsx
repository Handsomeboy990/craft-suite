import type { CSSProperties, ReactNode } from "react";
import { usePointerFollow } from "../../hooks/use-pointer-follow";

/*
 * Tilt.
 *
 * Leans one surface, a card or an image, a few degrees toward the pointer
 * while the pointer is over it, and lays it flat again when the pointer
 * leaves. For a single element; a grid of tilting cards reads as a template.
 *
 * Pointer only, transform only (a rotation under a fixed perspective), one
 * write per animation frame, through the shared `usePointerFollow`. Touch and
 * keyboard focus move nothing. Under reduced motion, or where
 * requestAnimationFrame is absent, no handler is attached and the surface
 * stays flat.
 */

export interface TiltProps {
  /** The single surface to tilt. */
  children: ReactNode;
  /** Largest rotation, in degrees, reached at the edge of the surface. */
  maxDeg?: number;
  /** Perspective distance, in pixels; smaller reads as a stronger tilt. */
  perspectivePx?: number;
  className?: string;
}

const targetStyle: CSSProperties = {
  transition: "transform var(--cu-motion-base, 200ms) var(--cu-motion-ease, ease)",
  transformOrigin: "center",
};

export function Tilt({ children, maxDeg = 6, perspectivePx = 800, className }: TiltProps) {
  const { areaRef, targetRef, enabled, handlers } = usePointerFollow<HTMLDivElement>(
    (x, y) =>
      `perspective(${perspectivePx}px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg)`,
  );

  return (
    <div
      ref={areaRef}
      data-cu="tilt"
      data-enabled={enabled}
      className={className}
      {...handlers}
    >
      <div
        ref={targetRef}
        data-cu="tilt-target"
        style={enabled ? targetStyle : undefined}
      >
        {children}
      </div>
    </div>
  );
}
