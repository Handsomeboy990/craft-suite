import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, it, expect } from "vitest";
import { Tooltip, TooltipProvider } from "./tooltip";

beforeAll(() => {
  // jsdom ships no ResizeObserver; the positioning layer measures with it.
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

function Example() {
  return (
    <>
      <button type="button">Before</button>
      <Tooltip content="Copy the link to this page">
        <button type="button">Share</button>
      </Tooltip>
    </>
  );
}

describe("Tooltip", () => {
  it("is not shown until the trigger is hovered or focused", () => {
    render(<Example />);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.getByRole("button", { name: "Share" })).not.toHaveAccessibleDescription();
  });

  it("opens on keyboard focus and describes its trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    const trigger = screen.getByRole("button", { name: "Share" });
    expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Copy the link to this page");
    expect(trigger).toHaveAccessibleDescription("Copy the link to this page");
    // The trigger keeps its own name; the tooltip only describes it.
    expect(trigger).toHaveAccessibleName("Share");
  });

  it("opens on hover", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.hover(screen.getByRole("button", { name: "Share" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy the link to this page");
  });

  it("closes on Escape without moving focus", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(screen.getByRole("button", { name: "Share" })).toHaveFocus();
  });

  it("works inside a TooltipProvider group, one tooltip at a time", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayMs={0}>
        <Tooltip content="Bold">
          <button type="button">B</button>
        </Tooltip>
        <Tooltip content="Italic">
          <button type="button">I</button>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Bold");
    await user.tab();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "I" })).toHaveAccessibleDescription("Italic"),
    );
    await waitFor(() => expect(screen.getAllByRole("tooltip")).toHaveLength(1));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Italic");
  });
});
