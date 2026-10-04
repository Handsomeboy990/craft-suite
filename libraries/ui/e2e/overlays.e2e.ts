import { expect, gotoFixture, test } from "./support";

test.describe("Dialog in a real browser", () => {
  test("moves focus in, traps Tab both ways, closes on Escape and returns focus", async ({
    page,
  }) => {
    await gotoFixture(page, "dialog");
    const trigger = page.getByRole("button", { name: "Invite a teammate" });
    await page.getByRole("link", { name: "Before the trigger" }).focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Invite a teammate" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription("They receive an email with a link.");
    const inside = () => page.evaluate(() => !!document.activeElement?.closest("[role='dialog']"));
    expect(await inside()).toBe(true);

    // Three stops inside: the field, Cancel, Send invite. Twice round, each way.
    const visited: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      expect(await inside()).toBe(true);
      visited.push(await page.evaluate(() => document.activeElement?.textContent || document.activeElement?.tagName || ""));
    }
    expect(new Set(visited)).toEqual(new Set(["INPUT", "Cancel", "Send invite"]));
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(await inside()).toBe(true);
    }

    // The page behind is out of the accessibility tree while the dialog is open.
    await expect(page.getByRole("link", { name: "After the trigger" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("link", { name: "After the trigger" })).toHaveCount(1);
  });

  test("closes from its Cancel button and returns focus to the trigger", async ({ page }) => {
    await gotoFixture(page, "dialog");
    const trigger = page.getByRole("button", { name: "Invite a teammate" });
    await trigger.click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe("Tooltip in a real browser", () => {
  test("opens on keyboard focus, describes the trigger, and closes on Escape", async ({ page }) => {
    await gotoFixture(page, "tooltip");
    await page.getByRole("link", { name: "Before the trigger" }).focus();
    await page.keyboard.press("Tab");
    const trigger = page.getByRole("button", { name: "Copy link" });
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveText("Copies the link to your clipboard");
    await expect(trigger).toHaveAccessibleDescription("Copies the link to your clipboard");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    // Moving focus on closes nothing that is not open, and opens nothing elsewhere.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "After the trigger" })).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });

  test("opens on hover and closes when the pointer leaves", async ({ page }) => {
    await gotoFixture(page, "tooltip");
    const trigger = page.getByRole("button", { name: "Copy link" });
    await trigger.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Copies the link to your clipboard");
    const box = await page.locator("[data-cu='tooltip']").boundingBox();
    const triggerBox = await trigger.boundingBox();
    // Shown on its preferred side, above the trigger, and fully in the viewport.
    expect(box!.y + box!.height).toBeLessThanOrEqual(triggerBox!.y);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    // A real path away, so Radix's hover grace area sees the pointer leave it.
    await page.mouse.move(5, 600, { steps: 10 });
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});

test.describe("Counter in a real browser", () => {
  test("exposes only the final value to the accessibility tree, before, during and after the count", async ({
    page,
  }) => {
    await gotoFixture(page, "counter");
    const figure = page.getByTestId("figure");
    const counter = page.locator("[data-cu='counter']");
    const expected = "- paragraph: 12,000 customers";

    // Before: rewound to 0 on screen, final value in the tree.
    await expect(page.locator("[data-cu='counter-display']")).toHaveText("0");
    await expect(figure).toMatchAriaSnapshot(expected);

    // During: the digits move; the tree does not.
    await figure.scrollIntoViewIfNeeded();
    await expect(counter).toHaveAttribute("data-done", "false");
    await expect
      .poll(() => page.locator("[data-cu='counter-display']").textContent())
      .not.toMatch(/^(0|12,000)$/);
    expect(await counter.getAttribute("data-done")).toBe("false");
    await expect(figure).toMatchAriaSnapshot(expected);
    expect(await figure.ariaSnapshot()).toBe(expected);

    // After: the display lands on the exact value.
    await expect(counter).toHaveAttribute("data-done", "true");
    await expect(page.locator("[data-cu='counter-display']")).toHaveText("12,000");
    expect(await figure.ariaSnapshot()).toBe(expected);
  });
});
