import namer from "color-namer";
import type { ColorMatchResult, CoreOptions } from "./types.js";

/**
 * Map from color-namer basic names to our basic categories.
 * color-namer's "basic" list uses names like "aqua", "fuchsia"
 * which we normalize to our simpler categories.
 */
const NAMER_TO_BASIC: Record<string, string> = {
  black: "black",
  white: "white",
  red: "red",
  green: "green",
  blue: "blue",
  yellow: "yellow",
  aqua: "blue",
  fuchsia: "purple",
  lime: "green",
  maroon: "red",
  navy: "blue",
  olive: "green",
  purple: "purple",
  silver: "gray",
  gray: "gray",
  teal: "blue",
  orange: "orange",
  // Extended basic palette names from color-namer
  indigo: "blue",
  violet: "purple",
  turquoise: "blue",
  cyan: "blue",
  magenta: "purple",
  pink: "pink",
  beige: "yellow",
  tan: "brown",
  brown: "brown",
  gold: "yellow",
};

/**
 * Convert a hex color string to its basic color category.
 *
 * Uses color-namer with the "basic" palette (roygbiv-like)
 * then normalizes to our standard categories.
 *
 * @param hex - CSS hex color, with or without #. Supports 3, 6, or 8 digit.
 * @returns Basic color category string (e.g. "blue", "red", "gray")
 */
export function hexToBasicColor(hex: string): string {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const result = namer(normalized, { pick: ["basic"] });
  const closest = result.basic[0];

  return NAMER_TO_BASIC[closest.name.toLowerCase()] ?? closest.name.toLowerCase();
}

/**
 * Parse any CSS color string to hex.
 * Handles: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), named CSS colors.
 */
export function cssColorToHex(cssColor: string): string {
  const trimmed = cssColor.trim().toLowerCase();

  // Already hex
  if (trimmed.startsWith("#")) {
    return expandHex(trimmed);
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return rgbToHex(r, g, b);
  }

  // CSS named colors — fall through to color-namer which handles these
  return trimmed;
}

/**
 * Compare a claimed color name against an actual CSS hex value.
 *
 * This is the main function most consumers will use.
 *
 * @param claimedColor - The color word from the label (e.g. "blue", "dark green")
 * @param claimedBasicCategory - The basic category of the claim (from parser)
 * @param actualCssColor - The computed CSS color value (hex or rgb())
 * @param options - Configuration options
 */
export function matchColor(
  claimedColor: string,
  claimedBasicCategory: string,
  actualCssColor: string,
  options?: CoreOptions
): ColorMatchResult {
  const closeThreshold = options?.closeThreshold ?? 50;

  const actualHex = cssColorToHex(actualCssColor);
  const actualBasicCategory = hexToBasicColor(actualHex);

  // Get the distance from color-namer for confidence scoring
  const namerResult = namer(actualHex, { pick: ["basic"] });
  const distance = namerResult.basic[0].distance;

  const match = claimedBasicCategory === actualBasicCategory;

  let confidence: "exact" | "close" | "mismatch";
  if (match && distance < closeThreshold / 2) {
    confidence = "exact";
  } else if (match) {
    confidence = "close";
  } else {
    confidence = "mismatch";
  }

  return {
    match,
    claimedColor,
    claimedBasicCategory,
    actualHex,
    actualBasicCategory,
    distance,
    confidence,
  };
}

// --- Helpers ---

function expandHex(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length === 8) {
    return `#${h.slice(0, 6)}`; // strip alpha
  }
  return `#${h}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
