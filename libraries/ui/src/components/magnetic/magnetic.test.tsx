import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { Magnetic } from "./magnetic";

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

// jsdom ships no PointerEvent; a MouseEvent that carries a pointerType is enough.
class FakePointerEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "mouse";
  }
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
function runFrame() {
  const pending = frames;
  frames = [];
  act(() => pending.forEach((cb) => cb(0)));
}

// A 100 by 40 box at the origin, so the pointer maps to known x and y.
function mockBox(el: HTMLElement) {
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, x: 0, y: 0 }) as DOMRect;
}

beforeEach(() => {
  (window as { PointerEvent?: unknown }).PointerEvent = FakePointerEvent;
});

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (window as { PointerEvent?: unknown }).PointerEvent;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup() {
  const { container, unmount } = render(
    <Magnetic strength={10}>
      <a href="#start">Start</a>
    </Magnetic>,
  );
  const area = container.querySelector("[data-cu='magnetic']") as HTMLElement;
  const target = container.querySelector("[data-cu='magnetic-target']") as HTMLElement;
  mockBox(area);
  return { area, target, unmount };
}

describe("Magnetic", () => {
  it("leaves its child an ordinary, focusable link", () => {
    setup();
    const link = screen.getByRole("link", { name: "Start" });
    act(() => link.focus());
    expect(link).toHaveFocus();
  });

  it("attaches nothing and never moves under reduced motion", async () => {
    mockMatchMedia(true);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(area).toHaveAttribute("data-enabled", "false");
    fireEvent.pointerMove(area, { clientX: 100, clientY: 40, pointerType: "mouse" });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(target.style.transform).toBe("");
  });

  it("stays still where requestAnimationFrame is absent", async () => {
    mockMatchMedia(false);
    vi.stubGlobal("requestAnimationFrame", undefined);
    const { area, target } = setup();
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(area).toHaveAttribute("data-enabled", "false");
    fireEvent.pointerMove(area, { clientX: 100, clientY: 40, pointerType: "mouse" });
    expect(target.style.transform).toBe("");
  });

  it("follows a mouse once per frame, with transform only, and resets on leave", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));

    fireEvent.pointerMove(area, { clientX: 75, clientY: 30, pointerType: "mouse" });
    fireEvent.pointerMove(area, { clientX: 100, clientY: 40, pointerType: "mouse" });
    // Two moves in one frame schedule one frame, which uses the latest point.
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(target.style.willChange).toBe("transform");
    runFrame();
    expect(target.style.transform).toBe("translate3d(10.00px, 10.00px, 0)");
    expect(area.style.transform).toBe("");

    fireEvent.pointerLeave(area, { pointerType: "mouse" });
    expect(target.style.transform).toBe("");
    expect(target.style.willChange).toBe("");
  });

  it("ignores touch", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    fireEvent.pointerMove(area, { clientX: 100, clientY: 40, pointerType: "touch" });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(target.style.transform).toBe("");
  });

  it("moves nothing when its child takes keyboard focus", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    act(() => screen.getByRole("link", { name: "Start" }).focus());
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(target.style.transform).toBe("");
  });

  it("cancels a pending frame on unmount", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, unmount } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    fireEvent.pointerMove(area, { clientX: 10, clientY: 10, pointerType: "mouse" });
    expect(cancelAnimationFrame).not.toHaveBeenCalled();
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
