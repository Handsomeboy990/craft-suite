import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { useEntrance } from "./use-entrance";

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

function mockIntersectionObserver() {
  class FakeObserver {
    observe() {}
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
  vi.restoreAllMocks();
});

// jsdom lays nothing out: a detached element's box is empty at the top, off screen.
const element = () => ({ current: document.createElement("div") });

describe("useEntrance", () => {
  it("arms off-screen content when IntersectionObserver exists and motion is allowed", async () => {
    mockMatchMedia(false);
    mockIntersectionObserver();
    const ref = element();
    const { result } = renderHook(() => useEntrance(ref));
    await waitFor(() => expect(result.current.armed).toBe(true));
    expect(result.current.shown).toBe(false);
  });

  it("never arms without IntersectionObserver", async () => {
    const ref = element();
    const { result } = renderHook(() => useEntrance(ref));
    await waitFor(() => expect(result.current.shown).toBe(true));
    expect(result.current.armed).toBe(false);
  });

  it("never arms under reduced motion", async () => {
    mockMatchMedia(true);
    mockIntersectionObserver();
    const ref = element();
    const { result } = renderHook(() => useEntrance(ref));
    await waitFor(() => expect(result.current.shown).toBe(true));
    expect(result.current.armed).toBe(false);
  });
});
