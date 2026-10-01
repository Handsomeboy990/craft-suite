import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { useInViewOnce } from "./use-in-view-once";

// A controllable IntersectionObserver: the test decides when the element is seen.
let intersect: ((isIntersecting: boolean) => void) | null = null;
let disconnected = 0;
function mockIntersectionObserver() {
  disconnected = 0;
  class FakeObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      intersect = (isIntersecting) =>
        this.callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
    disconnect() {
      disconnected += 1;
    }
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = FakeObserver;
}

afterEach(() => {
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
  intersect = null;
});

const element = () => ({ current: document.createElement("div") });

describe("useInViewOnce", () => {
  it("reports seen at once where IntersectionObserver is absent", async () => {
    expect(typeof IntersectionObserver).toBe("undefined");
    const ref = element();
    const { result } = renderHook(() => useInViewOnce(ref));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("reports seen at once, observing nothing, when skipped", async () => {
    mockIntersectionObserver();
    const ref = element();
    const { result } = renderHook(() => useInViewOnce(ref, { skip: true }));
    await waitFor(() => expect(result.current).toBe(true));
    expect(intersect).toBeNull();
  });

  it("flips once on the first sighting, disconnects, and never flips back", () => {
    mockIntersectionObserver();
    const ref = element();
    const { result } = renderHook(() => useInViewOnce(ref));
    expect(result.current).toBe(false);
    act(() => intersect?.(false));
    expect(result.current).toBe(false);
    act(() => intersect?.(true));
    expect(result.current).toBe(true);
    expect(disconnected).toBeGreaterThan(0);
    act(() => intersect?.(false));
    expect(result.current).toBe(true);
  });
});
