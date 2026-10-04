import type { Locator } from "@playwright/test";
import { expect, gotoFixture, runningAnimations, test } from "./support";

/*
 * Reveal and Stagger share useEntrance: visible in the server HTML with no
 * script at all, never hidden when on screen at load, and an entrance only for
 * content that starts off screen, played when it is scrolled into view.
 */

const opacity = (locator: Locator) =>
  locator.evaluate((el) => Number(getComputedStyle(el).opacity));

const settledOpacity = (locator: Locator) =>
  locator.evaluate((el) => {
    // Opacity as the reader sees it: the product of every ancestor's.
    let value = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      value *= Number(getComputedStyle(node).opacity);
    }
    return value;
  });

test.describe("Reveal and Stagger with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("Reveal: the server HTML shows every block, with no hiding style", async ({ page }) => {
    await gotoFixture(page, "reveal", { hydrate: false });
    await expect(page.locator("body")).not.toHaveAttribute("data-hydrated", "true");
    for (const id of ["above", "below"]) {
      const block = page.getByTestId(id);
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible();
      expect(await settledOpacity(block)).toBe(1);
    }
    for (const wrapper of await page.locator("[data-cu='reveal']").all()) {
      await expect(wrapper).toHaveAttribute("data-armed", "false");
      await expect(wrapper).not.toHaveAttribute("style", /opacity|transform/);
    }
  });

  test("Stagger: the server HTML shows every item, with no hiding style", async ({ page }) => {
    await gotoFixture(page, "stagger", { hydrate: false });
    const items = page.locator("[data-cu='stagger-item']");
    await expect(items).toHaveCount(6);
    for (const item of await items.all()) {
      await item.scrollIntoViewIfNeeded();
      await expect(item).toBeVisible();
      expect(await settledOpacity(item)).toBe(1);
      await expect(item).not.toHaveAttribute("style", /opacity|transform/);
    }
  });
});

test.describe("Reveal and Stagger with JavaScript on", () => {
  test("Reveal: on screen at load is never armed; off screen enters when scrolled into view", async ({
    page,
  }) => {
    await gotoFixture(page, "reveal");
    const [above, below] = await page.locator("[data-cu='reveal']").all();
    await expect(above!).toHaveAttribute("data-armed", "false");
    expect(await opacity(above!)).toBe(1);

    await expect(below!).toHaveAttribute("data-armed", "true");
    await expect(below!).toHaveAttribute("data-shown", "false");
    // Hidden at once on arming, never faded out from the server HTML.
    expect(await opacity(below!)).toBe(0);
    expect(await runningAnimations(page)).toEqual([]);

    // Record the transitions the entrance really starts.
    await below!.evaluate((el) => {
      const runs: string[] = [];
      (window as unknown as { runs: string[] }).runs = runs;
      el.addEventListener("transitionrun", (event) => runs.push((event as TransitionEvent).propertyName));
    });
    await page.getByTestId("below").scrollIntoViewIfNeeded();
    await expect(below!).toHaveAttribute("data-shown", "true");
    await expect
      .poll(() => page.evaluate(() => [...(window as unknown as { runs: string[] }).runs].sort()))
      .toEqual(["opacity", "transform"]);
    // The transition runs, then settles fully visible and in place.
    await expect.poll(() => opacity(below!)).toBe(1);
    await expect.poll(() => below!.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await expect.poll(() => runningAnimations(page)).toEqual([]);
  });

  test("Stagger: off screen items enter in order, each a step later than the last", async ({
    page,
  }) => {
    await gotoFixture(page, "stagger");
    const [above, below] = await page.locator("[data-cu='stagger']").all();
    await expect(above!).toHaveAttribute("data-armed", "false");
    await expect(below!).toHaveAttribute("data-armed", "true");
    const items = below!.locator("[data-cu='stagger-item']");
    // Hidden at once on arming, never faded out from the server HTML.
    for (const item of await items.all()) expect(await opacity(item)).toBe(0);
    expect(await runningAnimations(page)).toEqual([]);

    await below!.scrollIntoViewIfNeeded();
    await expect(below!).toHaveAttribute("data-shown", "true");
    const delays = await items.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transitionDelay.split(",")[0]!.trim()),
    );
    expect(delays).toEqual(["0s", "0.08s", "0.16s", "0.24s"]);
    for (const item of await items.all()) await expect.poll(() => opacity(item)).toBe(1);
    await expect.poll(() => runningAnimations(page)).toEqual([]);
  });
});
