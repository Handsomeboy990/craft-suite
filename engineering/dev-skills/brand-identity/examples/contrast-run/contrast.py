#!/usr/bin/env python3
"""Measure WCAG 2.2 contrast ratios for the colour pairs of a palette.

Reads a CSV of pairs and prints one Markdown table row per pair, with the
measured ratio and the verdict against the threshold of the pair's use.

    python3 contrast.py pairs.csv

CSV columns: theme, foreground, foreground_hex, background, background_hex, use
where use is one of:
    text        body text, WCAG 2.2 SC 1.4.3, at least 4.5:1 (AAA 7:1)
    large-text  at least 24px, or 18.66px bold, SC 1.4.3, at least 3:1 (AAA 4.5:1)
    non-text    a control boundary, focus indicator or meaningful graphic,
                SC 1.4.11, at least 3:1

The ratio is compared unrounded: 4.499 fails 4.5. The printed value is
truncated, never rounded up, so a printed 4.50 is never a hidden 4.499.
Standard library only.
"""

import csv
import math
import sys

THRESHOLDS = {
    # use: (AA minimum, AAA minimum or None)
    "text": (4.5, 7.0),
    "large-text": (3.0, 4.5),
    "non-text": (3.0, None),
}


def channel(value):
    """Linearise one sRGB channel, 0 to 255, per the WCAG 2.2 definition."""
    c = value / 255.0
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour):
    """Relative luminance of an opaque #rrggbb colour."""
    h = hex_colour.strip().lstrip("#")
    if len(h) != 6:
        raise ValueError(f"expected #rrggbb, got {hex_colour!r}")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def ratio(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def truncate(value, places=2):
    factor = 10 ** places
    return math.floor(value * factor) / factor


def main(path):
    failures = 0
    print("| Theme | Foreground | Background | Use | Ratio | AA | AAA |")
    print("|---|---|---|---|---|---|---|")
    with open(path, newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            use = row["use"].strip()
            if use not in THRESHOLDS:
                raise ValueError(f"unknown use {use!r}")
            aa, aaa = THRESHOLDS[use]
            value = ratio(row["foreground_hex"], row["background_hex"])
            aa_ok = value >= aa
            aaa_cell = "n/a" if aaa is None else ("pass" if value >= aaa else "fail")
            if not aa_ok:
                failures += 1
            print(
                f"| {row['theme']} "
                f"| {row['foreground']} {row['foreground_hex']} "
                f"| {row['background']} {row['background_hex']} "
                f"| {use} "
                f"| {truncate(value):.2f}:1 "
                f"| {'pass' if aa_ok else 'FAIL'} "
                f"| {aaa_cell} |"
            )
    print()
    print(f"{failures} pair(s) below the AA threshold of their use.")
    return 1 if failures else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 contrast.py pairs.csv")
    sys.exit(main(sys.argv[1]))
