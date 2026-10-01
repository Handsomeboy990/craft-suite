import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import { Marquee } from "./marquee";

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

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (Element.prototype as { animate?: unknown }).animate;
  vi.restoreAllMocks();
});

function Example() {
  return (
    <Marquee label="Customers">
      <span>Alpha</span>
      <a href="#beta">Beta</a>
    </Marquee>
  );
}

describe("Marquee", () => {
  it("is a named group that renders its content once without the Web Animations API", async () => {
    // jsdom ships no Element.animate, so this is the real static fallback.
    render(<Example />);
    const group = screen.getByRole("group", { name: "Customers" });
    await waitFor(() => expect(group).toHaveAttribute("data-animated", "false"));
    expect(screen.getAllByText("Alpha")).toHaveLength(1);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("stays static, single and wrapped when the viewer asked for reduced motion", async () => {
    mockMatchMedia(true);
    const { animate } = mockAnimate();
    render(<Example />);
    const group = screen.getByRole("group", { name: "Customers" });
    await waitFor(() => expect(window.matchMedia).toHaveBeenCalled());
    expect(group).toHaveAttribute("data-animated", "false");
    expect(screen.getAllByText("Alpha")).toHaveLength(1);
    expect(animate).not.toHaveBeenCalled();
    const content = group.querySelector("[data-cu='marquee-content']") as HTMLElement;
    expect(content.style.flexWrap).toBe("wrap");
  });

  it("loops with an aria-hidden, inert duplicate that the keyboard and screen readers skip", async () => {
    mockMatchMedia(false);
    const { animate } = mockAnimate();
    render(<Example />);
    const group = screen.getByRole("group", { name: "Customers" });
    await waitFor(() => expect(group).toHaveAttribute("data-animated", "true"));
    expect(animate).toHaveBeenCalledTimes(1);
    const copies = group.querySelectorAll("[data-cu='marquee-content']");
    expect(copies).toHaveLength(2);
    expect(copies[0]).not.toHaveAttribute("aria-hidden");
    expect(copies[1]).toHaveAttribute("aria-hidden", "true");
    expect(copies[1]).toHaveAttribute("inert");
    // Only the visible copy is exposed: one link, not two.
    expect(screen.getAllByRole("link", { name: "Beta" })).toHaveLength(1);
  });

  it("pauses on hover and on focus, and resumes when both leave", async () => {
    mockMatchMedia(false);
    const { animation } = mockAnimate();
    render(<Example />);
    const group = screen.getByRole("group", { name: "Customers" });
    await waitFor(() => expect(group).toHaveAttribute("data-animated", "true"));
    const viewport = group.querySelector("[data-cu='marquee-viewport']") as HTMLElement;

    fireEvent.mouseEnter(viewport);
    await waitFor(() => expect(group).toHaveAttribute("data-paused", "true"));
    expect(animation.pause).toHaveBeenCalled();
    fireEvent.mouseLeave(viewport);
    await waitFor(() => expect(group).toHaveAttribute("data-paused", "false"));

    act(() => screen.getByRole("link", { name: "Beta" }).focus());
    await waitFor(() => expect(group).toHaveAttribute("data-paused", "true"));
    act(() => screen.getByRole("link", { name: "Beta" }).blur());
    await waitFor(() => expect(group).toHaveAttribute("data-paused", "false"));
    expect(animation.play).toHaveBeenCalled();
  });

  it("offers a toggle button with a stable name that pauses and resumes the loop", async () => {
    mockMatchMedia(false);
    const { animation } = mockAnimate();
    const user = userEvent.setup();
    render(<Example />);
    const button = await screen.findByRole("button", { name: "Pause motion" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(animation.pause).toHaveBeenCalled();
    // Focus left on the button keeps it paused; moving away keeps the user's choice.
    act(() => button.blur());
    const group = screen.getByRole("group", { name: "Customers" });
    expect(group).toHaveAttribute("data-paused", "true");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("cancels the animation on unmount", async () => {
    mockMatchMedia(false);
    const { animation } = mockAnimate();
    const { unmount } = render(<Example />);
    await screen.findByRole("button", { name: "Pause motion" });
    unmount();
    expect(animation.cancel).toHaveBeenCalled();
  });
});
