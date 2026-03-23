/** A color word found in a text string */
export interface ColorClaim {
  /** The color word as found in text, e.g. "blue", "Red", "dark green" */
  word: string;
  /** Normalized lowercase basic color category */
  basicCategory: string;
  /** Character position in original string */
  startIndex: number;
  endIndex: number;
}

/** Result of comparing a claimed color to an actual CSS color */
export interface ColorMatchResult {
  /** Does the claimed color match the actual rendered color? */
  match: boolean;
  /** The color word claimed in the label */
  claimedColor: string;
  /** The basic color category of the claim (e.g. "blue") */
  claimedBasicCategory: string;
  /** The hex value of the actual CSS color */
  actualHex: string;
  /** The basic color name derived from the actual CSS color */
  actualBasicCategory: string;
  /** Delta-E distance between claimed and actual (lower = closer) */
  distance: number;
  /** Confidence: "exact", "close", "mismatch" */
  confidence: "exact" | "close" | "mismatch";
}

/** WCAG contrast ratio result */
export interface ContrastResult {
  /** The computed contrast ratio (e.g. 4.5) */
  ratio: number;
  /** Foreground hex */
  foreground: string;
  /** Background hex */
  background: string;
  /** Passes WCAG AA for normal text (4.5:1) */
  passesAA: boolean;
  /** Passes WCAG AA for large text (3:1) */
  passesAALarge: boolean;
  /** Passes WCAG AAA for normal text (7:1) */
  passesAAA: boolean;
  /** Passes WCAG AAA for large text (4.5:1) */
  passesAAALarge: boolean;
}

/** Configuration options for core functions */
export interface CoreOptions {
  /**
   * Distance threshold for "close" match.
   * Below this = "close", above = "mismatch".
   * Default: 50
   */
  closeThreshold?: number;
  /**
   * Additional color words to recognize beyond built-in list.
   * Map of word → basic category.
   * e.g. { "crimson": "red", "navy": "blue", "teal": "blue" }
   */
  customColorMap?: Record<string, string>;
  /**
   * Language for color word detection.
   * Default: "en". Future: support other languages.
   */
  locale?: string;
}
