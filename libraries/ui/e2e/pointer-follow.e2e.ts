import type { Page } from "@playwright/test";
import { expect, frames, gotoFixture, test } from "./support";

/*
 * Magnetic and Tilt share usePointerFollow: a real mouse moves the target, a
 * real touch and keyboard focus do not, and leaving resets it.
 */

const CASES = [
  {
    name: "Magnetic",
    fixture: "magnetic",
    area: "[data-cu='magnetic']",
    target: "[data-cu='magnetic-target']",
    focusable: "Start a project",
    // At the right edge the pull is +strength (10px) on x.
    moved: /^translate3d\((9|10)(\.\d+)?px, /,
  },
  {
    name: "Tilt",
    fixture: "tilt",
    area: "[data-cu='tilt']",
    target: "[data-cu='tilt-target']",
    focusable: "Read the case study",
    // At the right edge the lean is +maxDeg (8deg) about y.
    moved: /^perspective\(800px\) rotateX\(-?\d+(\.\d+)?deg\) rotateY\((7|8)(\.\d+)?deg\)$/,
  },
] as const;

const inlineTransform = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => (el as HTMLElement).style.transform);

const computedTransform = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).transform);

const areaBox = async (page: Page, selector: string) => {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  return box;
};

for (const c of CASES) {
  test.describe(`${c.name} in a real browser`, () => {
    test("follows a real mouse, and resets on leave", async ({ page }) => {
      await gotoFixture(page, c.fixture);
      await expect(page.locator(c.area)).toHaveAttribute("data-enabled", "true");
      const box = await areaBox(page, c.area);
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + box.width / 2, y);
      await page.mouse.move(box.x + box.width - 1, y, { steps: 5 });
      await expect.poll(() => inlineTransform(page, c.target)).toMatch(c.moved);
      await expect.poll(() => computedTransform(page, c.target)).not.toBe("none");

      await page.mouse.move(box.x + box.width + 200, y + 200, { steps: 3 });
      await expect.poll(() => inlineTransform(page, c.target)).toBe("");
      // The eased return finishes at rest, not part way.
      await expect.poll(() => computedTransform(page, c.target)).toBe("none");
    });

    test("does not move for keyboard focus", async ({ page }) => {
      await gotoFixture(page, c.fixture);
      await expect(page.locator(c.area)).toHaveAttribute("data-enabled", "true");
      await page.getByRole("link", { name: c.focusable }).focus();
      await frames(page, 5);
      expect(await inlineTransform(page, c.target)).toBe("");
    });
  });

  test.describe(`${c.name} on a touch screen`, () => {
    test.use({ hasTouch: true });

    test("does not move for a real touch drag across it", async ({ page }) => {
      await gotoFixture(page, c.fixture);
      await expect(page.locator(c.area)).toHaveAttribute("data-enabled", "true");
      const box = await areaBox(page, c.area);
      const y = box.y + box.height / 2;
      const seen: string[] = [];
      await page.exposeFunction("recordPointer", (type: string) => seen.push(type));
      await page.locator(c.area).evaluate((area) => {
        area.addEventListener("pointermove", (event) =>
          (window as unknown as { recordPointer: (t: string) => void }).recordPointer((event as PointerEvent).pointerType),
        );
      });

      const cdp = await page.context().newCDPSession(page);
      const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number) =>
        cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: type === "touchEnd" ? [] : [{ x, y }],
        });
      await touch("touchStart", box.x + box.width / 2);
      for (let i = 1; i <= 5; i += 1) {
        await touch("touchMove", box.x + box.width / 2 + (i * box.width) / 12);
        await frames(page, 1);
      }
      await frames(page, 3);
      // The moves really arrived as touch pointer events, and moved nothing.
      expect(seen).toContain("touch");
      expect(await inlineTransform(page, c.target)).toBe("");
      await touch("touchEnd", 0);
      await frames(page, 3);
      expect(await inlineTransform(page, c.target)).toBe("");
    });
  });
}
