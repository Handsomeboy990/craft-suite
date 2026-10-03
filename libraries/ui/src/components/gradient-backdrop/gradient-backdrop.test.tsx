import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
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

  it("server-renders a still gradient with no control, for a page without JavaScript", () => {
    mockMatchMedia(false);
    mockAnimate();
    const html = renderToString(<GradientBackdrop />);
    expect(html).toContain('data-animated="false"');
    expect(html).toContain("gradient-backdrop-field");
    expect(html).not.toContain("<button");
  });

  it("offers a toggle button with a stable name that pauses and resumes the drift", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    const { animation } = mockAnimate();
    const user = userEvent.setup();
    const { container } = render(
      <section style={{ position: "relative" }}>
        <GradientBackdrop />
        <h2>Title</h2>
      </section>,
    );
    const button = await screen.findByRole("button", { name: "Pause motion" });
    // Beside the aria-hidden root, never inside it, so it stays reachable.
    expect(root(container).contains(button)).toBe(false);
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(root(container)).toHaveAttribute("data-paused", "true");
    expect(animation.pause).toHaveBeenCalled();

    // Coming back on screen does not override the viewer's choice.
    animation.play.mockClear();
    act(() => setVisible?.(false));
    act(() => setVisible?.(true));
    expect(animation.play).not.toHaveBeenCalled();
    expect(root(container)).toHaveAttribute("data-paused", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(root(container)).toHaveAttribute("data-paused", "false");
    expect(animation.play).toHaveBeenCalled();
  });

  it("names the control in the recipient's language, and omits it when opted out", async () => {
    mockMatchMedia(false);
    mockAnimate();
    const { unmount } = render(<GradientBackdrop pauseLabel="Mettre en pause" />);
    expect(await screen.findByRole("button", { name: "Mettre en pause" })).toBeInTheDocument();
    unmount();

    const { container } = render(<GradientBackdrop showControl={false} />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-animated", "true"));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders no control when nothing moves", async () => {
    mockMatchMedia(true);
    mockAnimate();
    const { container } = render(<GradientBackdrop />);
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(root(container)).toHaveAttribute("data-animated", "false");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("omits the grain when asked", () => {
    const { container } = render(<GradientBackdrop grain={false} />);
    expect(container.querySelector("[data-cu='gradient-backdrop-grain']")).toBeNull();
  });
});
