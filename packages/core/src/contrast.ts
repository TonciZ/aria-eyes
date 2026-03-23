import type { ContrastResult } from "./types.js";
import { cssColorToHex } from "./color-match.js";

/**
 * Calculate WCAG 2.1 relative luminance of a color.
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const [rL, gL, bL] = [r, g, b].map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

/**
 * Calculate WCAG contrast ratio between two colors.
 *
 * @param foreground - CSS color string (hex or rgb)
 * @param background - CSS color string (hex or rgb)
 * @returns ContrastResult with ratio and pass/fail for AA/AAA levels
 */
export function contrastRatio(
  foreground: string,
  background: string
): ContrastResult {
  const fgHex = cssColorToHex(foreground);
  const bgHex = cssColorToHex(background);

  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;

  return {
    ratio,
    foreground: fgHex,
    background: bgHex,
    passesAA: ratio >= 4.5,
    passesAALarge: ratio >= 3,
    passesAAA: ratio >= 7,
    passesAAALarge: ratio >= 4.5,
  };
}
