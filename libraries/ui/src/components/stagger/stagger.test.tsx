import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Stagger } from "./stagger";

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

// A controllable IntersectionObserver that counts how many elements it watches.
let intersect: (() => void) | null = null;
let observed = 0;
function mockIntersectionObserver() {
  observed = 0;
  class FakeObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      observed += 1;
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

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  intersect = null;
  vi.restoreAllMocks();
});

const items = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-cu='stagger-item']"));

describe("Stagger", () => {
  it("renders every child once, in source order", () => {
    const { container } = render(
      <Stagger>
        <span>one</span>
        <span>two</span>
        <span>three</span>
      </Stagger>,
    );
    expect(items(container).map((item) => item.textContent)).toEqual(["one", "two", "three"]);
  });

  it("shows every item at once when IntersectionObserver is absent", async () => {
    expect(typeof IntersectionObserver).toBe("undefined");
    const { container } = render(
      <Stagger>
        <span>a</span>
        <span>b</span>
      </Stagger>,
    );
    const group = container.querySelector("[data-cu='stagger']");
    await waitFor(() => expect(group).toHaveAttribute("data-shown", "true"));
    for (const item of items(container)) expect(item.style.opacity).toBe("1");
  });

  it("applies no transition, delay or hidden state under reduced motion", async () => {
    mockMatchMedia(true);
    mockIntersectionObserver();
    const { container } = render(
      <Stagger stepMs={100}>
        <span>a</span>
        <span>b</span>
      </Stagger>,
    );
    const group = container.querySelector("[data-cu='stagger']");
    await waitFor(() => expect(group).toHaveAttribute("data-shown", "true"));
    for (const item of items(container)) {
      expect(item.style.transition).toBe("");
      expect(item.style.transitionDelay).toBe("");
      expect(item.style.opacity).toBe("");
    }
  });

  it("watches the group with one observer and staggers the items once it is seen", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    const { container } = render(
      <Stagger stepMs={50} delayMs={20}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Stagger>,
    );
    await waitFor(() => expect(observed).toBe(1));
    expect(items(container).map((item) => item.style.opacity)).toEqual(["0", "0", "0"]);
    expect(items(container).map((item) => item.style.transitionDelay)).toEqual([
      "20ms",
      "70ms",
      "120ms",
    ]);
    act(() => intersect?.());
    expect(items(container).map((item) => item.style.opacity)).toEqual(["1", "1", "1"]);
  });

  it("caps the delay so a long group never drags", () => {
    const children = Array.from({ length: 14 }, (_, i) => <span key={i}>{i}</span>);
    const { container } = render(<Stagger stepMs={10}>{children}</Stagger>);
    const delays = items(container).map((item) => item.style.transitionDelay);
    expect(delays[10]).toBe("100ms");
    expect(delays[13]).toBe("100ms");
  });

  it("keeps list semantics when rendered as a list", () => {
    render(
      <Stagger as="ul">
        <span>first</span>
        <span>second</span>
      </Stagger>,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
