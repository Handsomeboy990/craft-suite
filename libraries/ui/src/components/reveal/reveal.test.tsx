import { render, screen, waitFor } from "@testing-library/react";
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

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>hello</Reveal>);
    expect(screen.getByText("hello")).toBeInTheDocument();
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
    const wrapper = screen.getByText("visible fallback").closest("[data-cu='reveal']");
    await waitFor(() => expect(wrapper).toHaveAttribute("data-shown", "true"));
  });

  it("applies no transition when the viewer asked for reduced motion", async () => {
    mockMatchMedia(true);
    render(
      <Reveal>
        <span>reduced</span>
      </Reveal>,
    );
    const wrapper = screen.getByText("reduced").closest("[data-cu='reveal']") as HTMLElement;
    await waitFor(() => expect(wrapper).toHaveAttribute("data-shown", "true"));
    expect(wrapper.style.transition).toBe("");
    expect(wrapper.style.opacity).toBe("");
  });
});
