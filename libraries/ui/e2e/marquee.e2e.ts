import type { Locator, Page } from "@playwright/test";
import { CUSTOMERS, PARTNERS } from "./fixtures/marquee";
import { expect, focusVisibility, frames, gotoFixture, test } from "./support";

/** The loop's animations, read from a group's track: play state and current time. */
const loop = (group: Locator) =>
  group.locator("[data-cu='marquee-track']").evaluate((track) =>
    track.getAnimations().map((animation) => ({
      playState: animation.playState,
      currentTime: Number(animation.currentTime),
    })),
  );

const state = (playState: "running" | "paused") => [expect.objectContaining({ playState })];
const currentTime = async (group: Locator) => (await loop(group))[0]!.currentTime;
const customers = (page: Page) => page.getByRole("group", { name: "Customers" });

test.describe("Marquee in a real browser", () => {
  test("runs one Web Animation, and the toggle really stops and restarts it", async ({ page }) => {
    await gotoFixture(page, "marquee");
    const group = customers(page);
    await expect(group).toHaveAttribute("data-animated", "true");
    await expect.poll(() => loop(group)).toEqual(state("running"));

    const start = await currentTime(group);
    await frames(page, 10);
    expect(await currentTime(group)).toBeGreaterThan(start);

    const toggle = group.getByRole("button", { name: "Pause motion" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    // The pointer is on the button, outside the strip: only the toggle holds the pause.
    await expect.poll(() => loop(group)).toEqual(state("paused"));
    const frozen = await currentTime(group);
    await frames(page, 10);
    expect(await currentTime(group)).toBe(frozen);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => loop(group)).toEqual(state("running"));
    await frames(page, 10);
    expect(await currentTime(group)).toBeGreaterThan(frozen);
  });

  test("pauses while the pointer is over the strip, resumes when it leaves", async ({ page }) => {
    await gotoFixture(page, "marquee");
    const group = customers(page);
    await expect.poll(() => loop(group)).toEqual(state("running"));
    await group.locator("[data-cu='marquee-viewport']").hover();
    await expect.poll(() => loop(group)).toEqual(state("paused"));
    await page.mouse.move(5, 5);
    await expect.poll(() => loop(group)).toEqual(state("running"));
  });

  for (const { label, names, from } of [
    { label: "Customers", names: CUSTOMERS.map((n) => `${n} Company`), from: "Before the marquee" },
    { label: "Partners", names: PARTNERS.map((n) => `${n} Partners Limited`), from: "Between the marquees" },
  ]) {
    test(`${label}: each item once in focus order, wholly in view while focused, then the toggle`, async ({
      page,
    }) => {
      await gotoFixture(page, "marquee");
      const group = page.getByRole("group", { name: label });
      await expect(group).toHaveAttribute("data-animated", "true");
      // Two copies are drawn; the second is aria-hidden and inert.
      await expect(group.getByText(names[0]!)).toHaveCount(2);
      await expect(group.getByRole("link", { name: names[0] })).toHaveCount(1);
      // Let the loop travel, so items start partly and wholly out of view.
      await frames(page, 30);

      await page.getByRole("link", { name: from }).focus();
      for (const name of names) {
        await page.keyboard.press("Tab");
        await expect(group.getByRole("link", { name })).toBeFocused();
        await expect.poll(() => loop(group)).toEqual(state("paused"));
        // Not clipped by the strip's viewport: all five sample points land on the item.
        await expect.poll(() => focusVisibility(page)).toMatchObject({ name, seen: 5 });
      }
      await page.keyboard.press("Tab");
      await expect(group.getByRole("button", { name: "Pause motion" })).toBeFocused();
      // The browser's focus scroll left no offset behind to shift the seam.
      expect(await group.locator("[data-cu='marquee-viewport']").evaluate((el) => el.scrollLeft)).toBe(0);
      await expect.poll(() => loop(group)).toEqual(state("running"));
    });
  }
});
