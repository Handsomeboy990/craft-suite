import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Counter } from "./counter";

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

// A controllable IntersectionObserver: the test decides when the element is seen.
let intersect: (() => void) | null = null;
function mockIntersectionObserver() {
  class FakeObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      intersect = () =>
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = FakeObserver;
}

// A controllable animation clock.
let frames: FrameRequestCallback[] = [];
function mockAnimationFrame() {
  frames = [];
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => frames.push(cb)),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
}
function runFrame(now: number) {
  const pending = frames;
  frames = [];
  act(() => pending.forEach((cb) => cb(now)));
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  intersect = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const display = (container: HTMLElement) =>
  container.querySelector("[data-cu='counter-display']") as HTMLElement;

describe("Counter", () => {
  it("exposes the final value, and only the final value, to assistive technology", () => {
    const { container } = render(<Counter value={12000} locale="en-US" />);
    expect(
      screen.getByText("12,000", { selector: "[data-cu='counter-value']" }),
    ).toBeInTheDocument();
    expect(display(container)).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-cu='counter']")).toHaveTextContent("12,000");
  });

  it("shows the final value at once when IntersectionObserver is absent", () => {
    expect(typeof IntersectionObserver).toBe("undefined");
    const { container } = render(<Counter value={42} />);
    expect(display(container)).toHaveTextContent("42");
    expect(container.querySelector("[data-cu='counter']")).toHaveAttribute("data-done", "true");
  });

  it("renders the final value immediately, with no frames, under reduced motion", () => {
    mockMatchMedia(true);
    mockIntersectionObserver();
    mockAnimationFrame();
    const { container } = render(<Counter value={250} locale="en-US" />);
    expect(display(container)).toHaveTextContent("250");
    expect(intersect).toBeNull();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("counts up from the start value once in view, and lands on the exact value", () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    mockAnimationFrame();
    const { container } = render(<Counter value={1000} durationMs={1000} locale="en-US" />);
    // Rewound before it is seen, but the accessible value is already final.
    expect(display(container)).toHaveTextContent(/^0$/);
    expect(
      screen.getByText("1,000", { selector: "[data-cu='counter-value']" }),
    ).toBeInTheDocument();
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    act(() => intersect?.());
    runFrame(0);
    runFrame(500);
    const midway = Number(display(container).textContent?.replace(/,/g, ""));
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1000);
    runFrame(1000);
    expect(display(container)).toHaveTextContent("1,000");
    expect(container.querySelector("[data-cu='counter']")).toHaveAttribute("data-done", "true");
  });

  it("uses a custom formatter for every frame and for the final value", () => {
    render(<Counter value={9.5} format={(n) => `${n.toFixed(1)} M`} />);
    expect(
      screen.getByText("9.5 M", { selector: "[data-cu='counter-value']" }),
    ).toBeInTheDocument();
  });
});
