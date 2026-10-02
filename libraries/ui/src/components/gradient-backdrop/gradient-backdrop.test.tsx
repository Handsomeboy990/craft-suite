import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { GradientBackdrop } from "./gradient-backdrop";

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

function mockAnimate() {
  const animation = { pause: vi.fn(), play: vi.fn(), cancel: vi.fn() };
  const animate = vi.fn(() => animation as unknown as Animation);
  Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
  return { animate, animation };
}

// A controllable IntersectionObserver.
let setVisible: ((visible: boolean) => void) | null = null;
function mockIntersectionObserver() {
  class FakeObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      setVisible = (isIntersecting) =>
        this.callback(
          [{ isIntersecting } as IntersectionObserverEntry],
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
  delete (Element.prototype as { animate?: unknown }).animate;
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  setVisible = null;
  vi.restoreAllMocks();
});

const root = (container: HTMLElement) =>
  container.querySelector("[data-cu='gradient-backdrop']") as HTMLElement;

describe("GradientBackdrop", () => {
  it("is decorative: hidden from assistive technology, out of flow, inert to the pointer", () => {
    const { container } = render(
      <section style={{ position: "relative" }}>
        <GradientBackdrop />
        <h2>Title</h2>
      </section>,
    );
    const backdrop = root(container);
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop.style.position).toBe("absolute");
    expect(backdrop.style.pointerEvents).toBe("none");
    expect(backdrop.textContent).toBe("");
    expect(backdrop.querySelector("a, button, input, [tabindex]")).toBeNull();
  });

  it("is a still gradient without the Web Animations API", async () => {
    // jsdom ships no Element.animate, so this is the real static fallback.
    const { container } = render(<GradientBackdrop />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-animated", "false"));
    expect(container.querySelector("[data-cu='gradient-backdrop-field']")).toBeInTheDocument();
  });

  it("stays still, with no animation started, under reduced motion", async () => {
    mockMatchMedia(true);
    const { animate } = mockAnimate();
    const { container } = render(<GradientBackdrop />);
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(root(container)).toHaveAttribute("data-animated", "false");
    expect(animate).not.toHaveBeenCalled();
  });

  it("drifts with one transform-only animation, pauses off screen and cancels on unmount", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    const { animate, animation } = mockAnimate();
    const { container, unmount } = render(<GradientBackdrop durationMs={30000} />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-animated", "true"));
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0] as unknown as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];
    for (const frame of keyframes) expect(Object.keys(frame)).toEqual(["transform"]);
    expect(options.duration).toBe(30000);

    act(() => setVisible?.(false));
    expect(animation.pause).toHaveBeenCalled();
    act(() => setVisible?.(true));
    expect(animation.play).toHaveBeenCalled();

    unmount();
    expect(animation.cancel).toHaveBeenCalled();
  });

  it("omits the grain when asked", () => {
    const { container } = render(<GradientBackdrop grain={false} />);
    expect(container.querySelector("[data-cu='gradient-backdrop-grain']")).toBeNull();
  });
});
