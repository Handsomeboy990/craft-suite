import { expect, focusVisibility, gotoFixture, test } from "./support";

const LINKS = ["Read about plan", "Read about build", "Read about test", "Read about ship"];

// The scroll position at which the last card reaches its pinning point, so
// every card of the deck is pinned at once. Measured before anything pins.
const deckPinnedAt = (page: import("@playwright/test").Page) =>
  page.$$eval("[data-cu='stacked-card']", (cards) => {
    const last = cards[cards.length - 1]!;
    const pinTop = parseFloat(getComputedStyle(last).top);
    return last.getBoundingClientRect().top + window.scrollY - pinTop;
  });

const cardTops = (page: import("@playwright/test").Page) =>
  page.$$eval("[data-cu='stacked-card']", (cards) =>
    cards.map((card) => Math.round(card.getBoundingClientRect().top)),
  );

test.describe("StackedCards in a real browser", () => {
  test("pins each card one step lower than the last, overlapping, with CSS sticky alone", async ({
    page,
  }) => {
    await gotoFixture(page, "stacked-cards");
    const list = page.getByRole("list", { name: "How it works" });
    await expect(list.getByRole("listitem")).toHaveCount(4);
    await expect(list.getByRole("listitem").first()).toHaveCSS("position", "sticky");

    // Before any scroll, nothing has pinned: each card sits in normal flow.
    expect((await cardTops(page))[0]).toBeGreaterThan(32);
    await page.evaluate((y) => window.scrollTo(0, y), await deckPinnedAt(page));
    await expect.poll(() => cardTops(page)).toEqual([32, 48, 64, 80]);

    // Every later card covers the one before it: at a point inside card 1,
    // below the top edge of card 2, the hit is in card 2 or later.
    const covered = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-cu='stacked-card']")];
      const hit = document.elementFromPoint(100, 120);
      return cards.findIndex((card) => card.contains(hit));
    });
    expect(covered).toBe(3);
  });

  test("keeps the focused link unobscured at every Tab stop, forward and back (WCAG 2.4.11)", async ({
    page,
  }) => {
    await gotoFixture(page, "stacked-cards");
    await page.getByRole("link", { name: "Before the stack" }).focus();
    for (const name of LINKS) {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name })).toBeFocused();
      expect(await focusVisibility(page)).toMatchObject({ name, seen: 5 });
    }
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "After the stack" })).toBeFocused();

    // Back up from below, once the whole deck has pinned and every earlier
    // link sits under a later card.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate((y) => window.scrollTo(0, y), await deckPinnedAt(page));
    await expect.poll(() => cardTops(page)).toEqual([32, 48, 64, 80]);
    for (const name of [...LINKS].reverse()) {
      await page.keyboard.press("Shift+Tab");
      await expect(page.getByRole("link", { name })).toBeFocused();
      expect(await focusVisibility(page)).toMatchObject({ name, seen: 5 });
    }
  });
});
