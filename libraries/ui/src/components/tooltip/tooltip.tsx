import * as RadixTooltip from "@radix-ui/react-tooltip";
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/*
 * Tooltip.
 *
 * A short supplementary label shown on hover and on keyboard focus. The
 * behaviour, delay, Escape to dismiss, collision-aware positioning and the
 * aria-describedby wiring, comes from @radix-ui/react-tooltip; the look and
 * the API are the suite's own, per decision record 0002. Radix is wrapped,
 * never exposed, so the base can be swapped at this file alone.
 *
 * The wrapper keeps the API closed on purpose: one trigger, one piece of
 * content, a side and a delay. A tooltip describes; it never holds the only
 * copy of information or an interactive control, because touch users and many
 * screen-reader users will not see it. The trigger must therefore be a real,
 * focusable element with its own accessible name.
 *
 * A Tooltip outside any `TooltipProvider` brings its own, so it works dropped
 * anywhere. Inside one, it joins the group: the group's delay applies and a
 * second tooltip opens at once while the pointer moves along a toolbar.
 *
 * No entrance animation: a tooltip that has to wait for a fade is slower to
 * read, and under reduced motion there would be nothing left to remove.
 */

export interface TooltipProps {
  /** The trigger: a single focusable element, such as a button or a link, with its own accessible name. */
  children: ReactElement;
  /** The tooltip text. Required. */
  content: ReactNode;
  /** Preferred side; Radix flips it when there is no room. */
  side?: "top" | "right" | "bottom" | "left";
  /** Hover delay before opening, in milliseconds. Keyboard focus opens it at once. Inside a `TooltipProvider`, the group's delay applies unless this is set. */
  delayMs?: number;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TooltipProviderProps {
  children: ReactNode;
  /** Hover delay before the first tooltip in the group opens, in milliseconds. */
  delayMs?: number;
}

// Lets a Tooltip know a group provider is already above it, so it does not
// shadow the group with a provider of its own.
const InProvider = createContext(false);

export function TooltipProvider({ children, delayMs = 300 }: TooltipProviderProps) {
  return (
    <InProvider.Provider value={true}>
      <RadixTooltip.Provider delayDuration={delayMs}>{children}</RadixTooltip.Provider>
    </InProvider.Provider>
  );
}

const contentStyle: CSSProperties = {
  maxWidth: "min(90vw, 20rem)",
  padding: "var(--cu-space-1, 0.25rem) var(--cu-space-2, 0.5rem)",
  background: "var(--cu-color-text, #15181c)",
  color: "var(--cu-color-bg, #ffffff)",
  borderRadius: "var(--cu-radius-sm, 0.25rem)",
  boxShadow: "var(--cu-shadow-2, 0 8px 24px rgba(15,18,22,0.16))",
  font: "var(--cu-text-sm, 0.833rem)/1.4 var(--cu-font-sans, system-ui, sans-serif)",
  zIndex: 50,
};

export function Tooltip({
  children,
  content,
  side = "top",
  delayMs,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const grouped = useContext(InProvider);
  const tooltip = (
    <RadixTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayMs}
    >
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content data-cu="tooltip" side={side} sideOffset={6} style={contentStyle}>
          {content}
          <RadixTooltip.Arrow
            data-cu="tooltip-arrow"
            width={10}
            height={5}
            style={{ fill: "var(--cu-color-text, #15181c)" }}
          />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
  if (grouped) return tooltip;
  return <TooltipProvider delayMs={delayMs ?? 300}>{tooltip}</TooltipProvider>;
}
