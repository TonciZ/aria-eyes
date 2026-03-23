import type { ColorClaim, CoreOptions } from "./types.js";

/**
 * Built-in color word map.
 * Keys: words to detect (lowercase).
 * Values: basic color category they belong to.
 */
const DEFAULT_COLOR_MAP: Record<string, string> = {
  // Basic categories (identity mappings)
  red: "red",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  blue: "blue",
  purple: "purple",
  pink: "pink",
  brown: "brown",
  black: "black",
  white: "white",
  gray: "gray",
  grey: "gray",

  // Common sub-colors mapped to basic categories
  crimson: "red",
  scarlet: "red",
  maroon: "red",
  ruby: "red",
  burgundy: "red",
  vermilion: "red",

  navy: "blue",
  teal: "blue",
  cyan: "blue",
  azure: "blue",
  cobalt: "blue",
  indigo: "blue",
  cerulean: "blue",
  sapphire: "blue",

  lime: "green",
  olive: "green",
  emerald: "green",
  mint: "green",
  sage: "green",
  forest: "green",
  jade: "green",

  violet: "purple",
  lavender: "purple",
  magenta: "purple",
  plum: "purple",
  mauve: "purple",
  lilac: "purple",
  amethyst: "purple",
  fuchsia: "purple",

  coral: "orange",
  salmon: "orange",
  peach: "orange",
  tangerine: "orange",
  amber: "orange",
  gold: "yellow",
  golden: "yellow",
  cream: "yellow",
  beige: "yellow",
  ivory: "white",

  rose: "pink",
  blush: "pink",

  tan: "brown",
  chocolate: "brown",
  coffee: "brown",
  sienna: "brown",
  umber: "brown",
  khaki: "brown",

  charcoal: "gray",
  silver: "gray",
  slate: "gray",
  ash: "gray",
};

/**
 * Compound color modifiers that precede a color word.
 * "dark blue" → still "blue", "light green" → still "green"
 */
const COLOR_MODIFIERS = ["dark", "light", "bright", "pale", "deep", "vivid", "muted", "soft", "hot", "neon"];

/**
 * Extract all color claims from a text string.
 *
 * Handles:
 * - Single color words: "blue button"
 * - Modified colors: "dark blue button", "light green indicator"
 * - Multiple colors: "red and blue icon"
 * - Case insensitive
 *
 * Does NOT extract:
 * - Color hex codes (that is the actual value, not a claim)
 * - Color in unrelated context: "feeling blue" (future: NLP disambiguation)
 */
export function extractColorClaims(
  text: string,
  options?: CoreOptions
): ColorClaim[] {
  const colorMap = {
    ...DEFAULT_COLOR_MAP,
    ...(options?.customColorMap ?? {}),
  };

  const claims: ColorClaim[] = [];
  const lowerText = text.toLowerCase();

  // Build regex pattern from all known color words, longest first
  // to match "dark blue" before "blue"
  const allWords = Object.keys(colorMap);
  const modifierPattern = COLOR_MODIFIERS.join("|");
  const colorPattern = allWords
    .sort((a, b) => b.length - a.length)
    .join("|");

  // Match optional modifier + color word at word boundaries
  const regex = new RegExp(
    `\\b(?:(${modifierPattern})\\s+)?(${colorPattern})\\b`,
    "gi"
  );

  let match: RegExpExecArray | null;
  while ((match = regex.exec(lowerText)) !== null) {
    const colorWord = match[2].toLowerCase();
    const fullMatch = match[0];

    claims.push({
      word: fullMatch.trim(),
      basicCategory: colorMap[colorWord] ?? colorWord,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  return claims;
}

/**
 * Check if a string contains any color claims.
 * Quick boolean check without full extraction.
 */
export function hasColorClaims(
  text: string,
  options?: CoreOptions
): boolean {
  return extractColorClaims(text, options).length > 0;
}

/**
 * Get the merged color map (defaults + custom).
 * Useful for debugging or extending.
 */
export function getColorMap(
  options?: CoreOptions
): Record<string, string> {
  return {
    ...DEFAULT_COLOR_MAP,
    ...(options?.customColorMap ?? {}),
  };
}
