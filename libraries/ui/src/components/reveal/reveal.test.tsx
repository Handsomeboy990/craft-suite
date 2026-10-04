import { act, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Reveal } from "./reveal";

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

// Puts every element inside the viewport, as content at the top of a page is.
function mockOnScreen() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: 10,
    bottom: 110,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect);
}

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  intersect = null;
  vi.restoreAllMocks();
});

const wrapperOf = (text: string) =>
  screen.getByText(text).closest("[data-cu='reveal']") as HTMLElement;

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>hello</Reveal>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("server-renders its content visible, with no hiding style, for a page without JavaScript", () => {
    // Even where the client would animate, the HTML a crawler or a no-script
    // reader gets is the content at rest: no opacity, no transform.
    mockMatchMedia(false);
    mockIntersectionObserver();
    const html = renderToString(<Reveal delayMs={80}>server copy</Reveal>);
    expect(html).toContain("server copy");
    expect(html).not.toMatch(/opacity|transform|transition/);
    expect(html).toContain('data-armed="false"');
  });

  it("shows content immediately when IntersectionObserver is absent", async () => {
    // jsdom defines no IntersectionObserver, so this is the real fallback path:
    // motion never hides content it cannot later reveal.
    expect(typeof IntersectionObserver).toBe("undefined");
    render(
      <Reveal>
        <span>visible fallback</span>
      </Reveal>,
    );
    const wrapper = wrapperOf("visible fallback");
    await waitFor(() => expect(wrapper).toHaveAttribute("data-shown", "true"));
    expect(wrapper).toHaveAttribute("data-armed", "false");
    expect(wrapper.style.opacity).toBe("");
  });

  it("applies no transition when the viewer asked for reduced motion", async () => {
    mockMatchMedia(true);
    mockIntersectionObserver();
    render(
      <Reveal>
        <span>reduced</span>
      </Reveal>,
    );
    const wrapper = wrapperOf("reduced");
    await waitFor(() => expect(wrapper).toHaveAttribute("data-shown", "true"));
    expect(wrapper).toHaveAttribute("data-armed", "false");
    expect(wrapper.style.transition).toBe("");
    expect(wrapper.style.opacity).toBe("");
  });

  it("arms off-screen content on the client and reveals it once seen", async () => {
    // jsdom lays nothing out, so every box is empty at the top: off screen.
    mockMatchMedia(false);
    mockIntersectionObserver();
    render(
      <Reveal delayMs={40}>
        <span>below the fold</span>
      </Reveal>,
    );
    const wrapper = wrapperOf("below the fold");
    await waitFor(() => expect(wrapper).toHaveAttribute("data-armed", "true"));
    expect(wrapper.style.opacity).toBe("0");
    act(() => intersect?.());
    expect(wrapper.style.opacity).toBe("1");
    expect(wrapper.style.transition).toMatch(/opacity/);
    expect(wrapper.style.transitionDelay).toBe("40ms");
  });

  it("hides armed content at once, with no transition, so it never fades out", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    render(
      <Reveal delayMs={40}>
        <span>below the fold</span>
      </Reveal>,
    );
    const wrapper = wrapperOf("below the fold");
    await waitFor(() => expect(wrapper).toHaveAttribute("data-armed", "true"));
    // A transition here would play the server HTML fading out, then in again.
    expect(wrapper.style.transition).toBe("");
    expect(wrapper.style.transitionDelay).toBe("");
  });

  it("never hides content already on screen at mount, so there is no flash", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    mockOnScreen();
    render(
      <Reveal>
        <span>above the fold</span>
      </Reveal>,
    );
    const wrapper = wrapperOf("above the fold");
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(wrapper).toHaveAttribute("data-armed", "false");
    expect(wrapper.style.opacity).toBe("");
  });
});
