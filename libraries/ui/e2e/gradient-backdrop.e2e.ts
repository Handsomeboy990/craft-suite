import type { Page } from "@playwright/test";
import { expect, focusVisibility, frames, gotoFixture, test } from "./support";

/** The drift's animations, read from the field: play state and current time. */
const drift = (page: Page) =>
  page.locator("[data-cu='gradient-backdrop-field']").evaluate((field) =>
    field.getAnimations().map((animation) => ({
      playState: animation.playState,
      currentTime: Number(animation.currentTime),
    })),
  );

const state = (playState: "running" | "paused") => [expect.objectContaining({ playState })];

test.describe("GradientBackdrop in a real browser", () => {
  test("drifts with one Web Animation, and the toggle really stops and restarts it", async ({
    page,
  }) => {
    await gotoFixture(page, "gradient-backdrop");
    await expect.poll(() => drift(page)).toEqual(state("running"));
    const start = (await drift(page))[0]!.currentTime;
    await frames(page, 10);
    expect((await drift(page))[0]!.currentTime).toBeGreaterThan(start);

    const toggle = page.getByRole("button", { name: "Pause motion" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => drift(page)).toEqual(state("paused"));
    const frozen = (await drift(page))[0]!.currentTime;
    await frames(page, 10);
    expect((await drift(page))[0]!.currentTime).toBe(frozen);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => drift(page)).toEqual(state("running"));
  });

  test("pauses off screen, and a viewer's pause survives leaving and re-entering the screen", async ({
    page,
  }) => {
    await gotoFixture(page, "gradient-backdrop");
    await expect.poll(() => drift(page)).toEqual(state("running"));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => drift(page)).toEqual(state("paused"));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => drift(page)).toEqual(state("running"));

    await page.getByRole("button", { name: "Pause motion" }).click();
    await expect.poll(() => drift(page)).toEqual(state("paused"));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("[data-cu='gradient-backdrop']")).toHaveAttribute("data-paused", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await frames(page, 10);
    await expect.poll(() => drift(page)).toEqual(state("paused"));
    await expect(page.getByRole("button", { name: "Pause motion" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("puts the toggle first in the section's focus order, visible, above the backdrop", async ({
    page,
  }) => {
    await gotoFixture(page, "gradient-backdrop");
    await page.getByRole("link", { name: "Before the section" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Pause motion" })).toBeFocused();
    expect(await focusVisibility(page)).toMatchObject({ name: "Pause motion", seen: 5 });
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Start here" })).toBeFocused();
    // The backdrop itself is never a stop: it holds nothing focusable.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "After the section" })).toBeFocused();
  });

  test("takes no pointer events: a click on the backdrop reaches the content in front", async ({
    page,
  }) => {
    await gotoFixture(page, "gradient-backdrop");
    const hit = await page.locator("section").evaluate((section) => {
      const box = section.getBoundingClientRect();
      const el = document.elementFromPoint(box.left + box.width / 2, box.bottom - 10);
      return el?.closest("[data-cu='gradient-backdrop']") ? "backdrop" : el?.tagName;
    });
    expect(hit).toBe("SECTION");
  });
});
