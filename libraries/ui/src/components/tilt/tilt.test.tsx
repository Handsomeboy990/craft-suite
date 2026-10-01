import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { Tilt } from "./tilt";

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
  const { container } = render(
    <Tilt maxDeg={10} perspectivePx={600}>
      <article aria-label="Plan">
        <h3>Plan</h3>
        <button type="button">Choose</button>
      </article>
    </Tilt>,
  );
  const area = container.querySelector("[data-cu='tilt']") as HTMLElement;
  const target = container.querySelector("[data-cu='tilt-target']") as HTMLElement;
  area.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0 }) as DOMRect;
  return { area, target };
}

describe("Tilt", () => {
  it("stays flat, with no handlers, under reduced motion", async () => {
    mockMatchMedia(true);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(area).toHaveAttribute("data-enabled", "false");
    fireEvent.pointerMove(area, { clientX: 0, clientY: 0, pointerType: "mouse" });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(target.style.transform).toBe("");
    expect(target.style.transition).toBe("");
  });

  it("tilts toward a mouse in one frame and lies flat again on leave", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    // Top-left corner: x = -1, y = -1.
    fireEvent.pointerMove(area, { clientX: 0, clientY: 0, pointerType: "mouse" });
    runFrame();
    expect(target.style.transform).toBe("perspective(600px) rotateX(10.00deg) rotateY(-10.00deg)");
    fireEvent.pointerLeave(area, { pointerType: "mouse" });
    expect(target.style.transform).toBe("");
  });

  it("resets when the pointer is cancelled", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    fireEvent.pointerMove(area, { clientX: 200, clientY: 100, pointerType: "pen" });
    runFrame();
    expect(target.style.transform).not.toBe("");
    fireEvent.pointerCancel(area, { pointerType: "pen" });
    expect(target.style.transform).toBe("");
  });

  it("ignores touch and keyboard focus, and keeps the content's roles", async () => {
    mockMatchMedia(false);
    mockAnimationFrame();
    const { area, target } = setup();
    await waitFor(() => expect(area).toHaveAttribute("data-enabled", "true"));
    fireEvent.pointerMove(area, { clientX: 0, clientY: 0, pointerType: "touch" });
    act(() => screen.getByRole("button", { name: "Choose" }).focus());
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(target.style.transform).toBe("");
    expect(screen.getByRole("article", { name: "Plan" })).toBeInTheDocument();
    expect(area).not.toHaveAttribute("role");
    expect(area).not.toHaveAttribute("tabindex");
  });
});
