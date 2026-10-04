import type { Page } from "@playwright/test";
import { expect, frames, gotoFixture, runningAnimations, test } from "./support";

/*
 * Reduced motion is a hard floor: every motion fixture renders its final
 * state, and the document runs no animation at all, Web Animation or CSS
 * transition, at load or after scrolling through the whole page.
 */

test.use({ reducedMotion: "reduce" });

/** Scrolls the page top to bottom in viewport steps, then waits a few frames. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await frames(page, 2);
  }
  await frames(page, 5);
}

test.describe("Under reduced motion", () => {
  test("the preference reaches the page", async ({ page }) => {
    await gotoFixture(page, "reveal");
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  });

  test("Marquee: one copy, wrapped, no animation, no toggle", async ({ page }) => {
    await gotoFixture(page, "marquee");
    const group = page.getByRole("group", { name: "Customers" });
    await expect(group).toHaveAttribute("data-animated", "false");
    await expect(group.getByText("Alder Company")).toHaveCount(1);
    await expect(group.getByRole("button")).toHaveCount(0);
    await expect(group.locator("[data-cu='marquee-content']")).toHaveCSS("flex-wrap", "wrap");
    // Every item is inside the viewport's width: nothing clipped.
    const overflow = await group.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBe(0);
    await scrollThrough(page);
    expect(await runningAnimations(page)).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("GradientBackdrop: still, no animation, no toggle", async ({ page }) => {
    await gotoFixture(page, "gradient-backdrop");
    await expect(page.locator("[data-cu='gradient-backdrop']")).toHaveAttribute("data-animated", "false");
    await expect(page.getByRole("button", { name: "Pause motion" })).toHaveCount(0);
    await scrollThrough(page);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Reveal and Stagger: never armed, every block fully visible, nothing transitions", async ({
    page,
  }) => {
    for (const name of ["reveal", "stagger"] as const) {
      await gotoFixture(page, name);
      for (const wrapper of await page.locator(`[data-cu='${name}']`).all()) {
        await expect(wrapper).toHaveAttribute("data-armed", "false");
      }
      await scrollThrough(page);
      const opacities = await page
        .locator("[data-cu='reveal'], [data-cu='stagger-item']")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(opacities.every((o) => o === "1")).toBe(true);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    }
  });

  test("Counter: the final value on screen from the start, no frames", async ({ page }) => {
    await gotoFixture(page, "counter");
    await expect(page.locator("[data-cu='counter']")).toHaveAttribute("data-done", "true");
    await expect(page.locator("[data-cu='counter-display']")).toHaveText("12,000");
    await scrollThrough(page);
    await expect(page.locator("[data-cu='counter-display']")).toHaveText("12,000");
  });

  test("StackedCards: an ordinary list, nothing pinned", async ({ page }) => {
    await gotoFixture(page, "stacked-cards");
    const list = page.getByRole("list", { name: "How it works" });
    await expect(list).toHaveAttribute("data-stacked", "false");
    for (const card of await list.getByRole("listitem").all()) {
      await expect(card).toHaveCSS("position", "static");
    }
  });

  test("Magnetic and Tilt: nothing attached, a real mouse moves nothing", async ({ page }) => {
    for (const [name, area, target] of [
      ["magnetic", "[data-cu='magnetic']", "[data-cu='magnetic-target']"],
      ["tilt", "[data-cu='tilt']", "[data-cu='tilt-target']"],
    ] as const) {
      await gotoFixture(page, name);
      await expect(page.locator(area)).toHaveAttribute("data-enabled", "false");
      const box = (await page.locator(area).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width - 1, box.y + 1, { steps: 5 });
      await frames(page, 3);
      expect(await page.locator(target).evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    }
  });
});
