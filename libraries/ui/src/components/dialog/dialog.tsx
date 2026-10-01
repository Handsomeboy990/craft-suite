import * as RadixDialog from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/*
 * Dialog.
 *
 * A thin wrapper over @radix-ui/react-dialog, per decision record 0002: the
 * accessibility (focus trap, Escape to close, aria wiring, scroll lock) comes
 * from Radix, the look and the API are ours, and Radix is never imported by a
 * consumer. Swapping the base later changes this file, not the screens.
 *
 * The wrapper enforces the one thing a dialog must never ship without: an
 * accessible name. `DialogContent` requires a `title`; there is no way to
 * render it unlabelled.
 */

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export interface DialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, "title"> {
  /** The accessible name of the dialog. Required: a dialog without one is a defect. */
  title: ReactNode;
  /** Optional supporting text, wired as the dialog's aria description. */
  description?: ReactNode;
  children?: ReactNode;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "var(--cu-color-overlay, rgba(15,18,22,0.5))",
};

const contentStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(90vw, 32rem)",
  background: "var(--cu-color-surface, #f6f7f9)",
  color: "var(--cu-color-text, #15181c)",
  border: "1px solid var(--cu-color-border, #d9dee5)",
  borderRadius: "var(--cu-radius-lg, 0.75rem)",
  boxShadow: "var(--cu-shadow-2, 0 8px 24px rgba(15,18,22,0.16))",
  padding: "var(--cu-space-6, 1.5rem)",
  font: "var(--cu-text-base, 1rem)/1.5 var(--cu-font-sans, system-ui, sans-serif)",
};

export function DialogContent({
  title,
  description,
  children,
  ...props
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay data-cu="dialog-overlay" style={overlayStyle} />
      <RadixDialog.Content data-cu="dialog-content" style={contentStyle} {...props}>
        <RadixDialog.Title
          data-cu="dialog-title"
          style={{
            margin: 0,
            fontSize: "var(--cu-text-xl, 1.44rem)",
            fontWeight: "var(--cu-weight-bold, 700)" as unknown as number,
          }}
        >
          {title}
        </RadixDialog.Title>
        {description ? (
          <RadixDialog.Description
            data-cu="dialog-description"
            style={{
              marginTop: "var(--cu-space-2, 0.5rem)",
              color: "var(--cu-color-muted, #5a6472)",
            }}
          >
            {description}
          </RadixDialog.Description>
        ) : null}
        <div style={{ marginTop: "var(--cu-space-4, 1rem)" }}>{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
