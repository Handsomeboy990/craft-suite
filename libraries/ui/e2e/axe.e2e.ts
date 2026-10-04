import { fixtures, type FixtureName } from "./fixtures";
import { axe, expect, gotoFixture, test } from "./support";

/*
 * axe-core, WCAG 2.0, 2.1 and 2.2 A and AA rules, on every fixture: at rest,
 * and for the overlays, open. A floor, never the verdict; the keyboard and
 * focus checks in the other files are the verdict. The engine version is
 * recorded on each test as an `axe-core` annotation.
 */

const names = Object.keys(fixtures) as FixtureName[];

test.describe("axe-core", () => {
  for (const name of names) {
    test(`${name}: no violations at rest`, async ({ page }, testInfo) => {
      await gotoFixture(page, name);
      expect(await axe(page, testInfo)).toEqual([]);
    });
  }

  test("dialog: no violations while open", async ({ page }, testInfo) => {
    await gotoFixture(page, "dialog");
    await page.getByRole("button", { name: "Invite a teammate" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axe(page, testInfo)).toEqual([]);
  });

  test("tooltip: no violations while open", async ({ page }, testInfo) => {
    await gotoFixture(page, "tooltip");
    await page.getByRole("button", { name: "Copy link" }).focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
    expect(await axe(page, testInfo)).toEqual([]);
  });

  test("everything, under reduced motion and in dark mode", async ({ browser }, testInfo) => {
    const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
    const page = await context.newPage();
    for (const name of names) {
      await gotoFixture(page, name);
      expect({ name, violations: await axe(page, testInfo) }).toEqual({ name, violations: [] });
    }
    await context.close();
  });
});
