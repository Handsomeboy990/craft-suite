import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page, type TestInfo } from "@playwright/test";
import type { FixtureName } from "./fixtures";

/*
 * Shared support for the browser tests.
 *
 * Every test gets a console audit for free: an error or warning on the console
 * and an uncaught page error both fail the test, so a hydration mismatch or a
 * React warning cannot pass unseen behind a green assertion.
 */

export const test = base.extend<{ consoleAudit: void }>({
  consoleAudit: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
          problems.push(`console.${message.type()}: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      await use();
      expect(problems, "console must stay clean").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Opens a fixture and, when scripts run, waits until React has hydrated it. */
export async function gotoFixture(page: Page, name: FixtureName, { hydrate = true } = {}) {
  await page.goto(`/${name}`);
  if (hydrate) await expect(page.locator("body")).toHaveAttribute("data-hydrated", "true");
}

/** Resolves after `count` animation frames, so a time-based check waits for frames, not milliseconds. */
export async function frames(page: Page, count = 10) {
  await page.evaluate(
    (n) =>
      new Promise<void>((resolve) => {
        let left = n;
        const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
    count,
  );
}

/**
 * How much of the focused element the reader can actually see: five sample
 * points (the centre and four corners, inset by 2px), each checked with
 * elementFromPoint. A point counts as seen when it lands on the focused
 * element or inside it, and inside the viewport.
 */
export async function focusVisibility(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { name: "", seen: 0, total: 5 };
    const r = el.getBoundingClientRect();
    const inset = 2;
    const points = [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + inset, r.top + inset],
      [r.right - inset, r.top + inset],
      [r.left + inset, r.bottom - inset],
      [r.right - inset, r.bottom - inset],
    ];
    let seen = 0;
    for (const [x, y] of points) {
      if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === el || el.contains(hit))) seen += 1;
    }
    return { name: el.textContent?.trim() ?? "", seen, total: points.length };
  });
}

/** Animations the document is running right now, CSS transitions and Web Animations alike. */
export async function runningAnimations(page: Page) {
  return page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target as HTMLElement | null;
          return target?.dataset.cu ?? target?.tagName ?? "unknown";
        }),
  );
}

/**
 * Runs axe-core against WCAG 2.0, 2.1 and 2.2 A and AA rules, records the
 * engine version on the test, and returns the violations.
 */
export async function axe(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  testInfo.annotations.push({ type: "axe-core", description: results.testEngine.version });
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
}
