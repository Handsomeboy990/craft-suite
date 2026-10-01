// @vitest-environment node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const css = readFileSync(
  fileURLToPath(new URL("./tokens.css", import.meta.url)),
  "utf8",
);

// The tokens other code relies on. A rename here is a breaking change, so the
// test names them explicitly rather than counting them.
const required = [
  "--cu-color-bg",
  "--cu-color-surface",
  "--cu-color-text",
  "--cu-color-muted",
  "--cu-color-border",
  "--cu-color-accent",
  "--cu-color-accent-text",
  "--cu-color-overlay",
  "--cu-text-base",
  "--cu-space-4",
  "--cu-radius-md",
  "--cu-shadow-2",
  "--cu-motion-base",
  "--cu-motion-ease",
];

describe("design tokens", () => {
  it("defines every required token on :root", () => {
    for (const token of required) {
      expect(css, `missing ${token}`).toContain(`${token}:`);
    }
  });

  it("redefines the colour tokens for an explicit dark theme", () => {
    const dark = css.slice(css.indexOf('[data-theme="dark"]'));
    for (const token of [
      "--cu-color-bg",
      "--cu-color-text",
      "--cu-color-accent",
    ]) {
      expect(dark, `dark theme does not override ${token}`).toContain(
        `${token}:`,
      );
    }
  });

  it("honours the system dark preference without forcing it on an explicit light root", () => {
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root:not([data-theme="light"])');
  });

  it("zeroes motion under prefers-reduced-motion", () => {
    const block = css.slice(
      css.indexOf("@media (prefers-reduced-motion: reduce)"),
    );
    expect(block).toContain("--cu-motion-base: 0ms");
  });
});
