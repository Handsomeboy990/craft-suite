import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { StackedCards } from "./stacked-cards";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  vi.restoreAllMocks();
});

function Example() {
  return (
    <StackedCards label="How it works" top="2rem" step="1rem">
      <section aria-label="Plan">
        <a href="#plan">Read the plan</a>
      </section>
      <section aria-label="Build">
        <a href="#build">See the build</a>
      </section>
      <section aria-label="Ship">
        <a href="#ship">Watch it ship</a>
      </section>
    </StackedCards>
  );
}

const cards = () => screen.getAllByRole("listitem");

describe("StackedCards", () => {
  it("is a named list whose items keep source order", () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "How it works" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Read the plan",
      "See the build",
      "Watch it ship",
    ]);
  });

  it("stacks with CSS sticky alone: growing top and z-index, no scroll listener", () => {
    const addWindow = vi.spyOn(window, "addEventListener");
    const addDocument = vi.spyOn(document, "addEventListener");
    render(<Example />);
    const [first, second, third] = cards();
    expect(first.style.position).toBe("sticky");
    // jsdom folds the calc; the pinning point still grows by one step per card.
    expect(first.style.top).toMatch(/^calc\(/);
    expect(third.style.top).toMatch(/^calc\(/);
    expect(third.style.top).not.toBe(first.style.top);
    expect(Number(first.style.zIndex)).toBeLessThan(Number(second.style.zIndex));
    expect(Number(second.style.zIndex)).toBeLessThan(Number(third.style.zIndex));
    const scrollCalls = [...addWindow.mock.calls, ...addDocument.mock.calls].filter(
      ([type]) => type === "scroll",
    );
    expect(scrollCalls).toHaveLength(0);
  });

  it("is an ordinary list, nothing pinned, under reduced motion", async () => {
    mockMatchMedia(true);
    render(<Example />);
    const list = screen.getByRole("list", { name: "How it works" });
    await waitFor(() => expect(list).toHaveAttribute("data-stacked", "false"));
    for (const card of cards()) {
      expect(card.style.position).toBe("");
      expect(card.style.top).toBe("");
    }
  });

  it("raises a card that takes keyboard focus above the cards that would cover it", () => {
    render(<Example />);
    const [first, , third] = cards();
    act(() => screen.getByRole("link", { name: "Read the plan" }).focus());
    expect(first).toHaveAttribute("data-focused", "true");
    expect(Number(first.style.zIndex)).toBeGreaterThan(Number(third.style.zIndex));
    act(() => screen.getByRole("link", { name: "Read the plan" }).blur());
    expect(first).toHaveAttribute("data-focused", "false");
    expect(Number(first.style.zIndex)).toBeLessThan(Number(third.style.zIndex));
  });
});
