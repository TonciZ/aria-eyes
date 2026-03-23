import type { ColorMatchResult, ContrastResult } from "@aria-eyes/core";

/** A single element with a color claim that was verified */
export interface ColorViolation {
  /** CSS selector or Playwright locator description */
  selector: string;
  /** The full accessible name (aria-label, alt, etc.) */
  accessibleName: string;
  /** The color claim found in the accessible name */
  colorClaim: string;
  /** The CSS property checked (color, background-color, border-color) */
  cssProperty: string;
  /** The computed CSS value */
  computedValue: string;
  /** Full match result from core */
  matchResult: ColorMatchResult;
  /** WCAG checkpoint reference */
  wcag: string;
  /** Human-readable message */
  message: string;
}

/** A contrast issue found on the page */
export interface ContrastViolation {
  selector: string;
  foreground: string;
  background: string;
  contrastResult: ContrastResult;
  fontSize: string;
  fontWeight: string;
  isLargeText: boolean;
  wcag: string;
  message: string;
}

/** Combined results from a full page scan */
export interface VerifyResults {
  /** Color claim mismatches (WCAG 1.4.1, 1.1.1) */
  colorViolations: ColorViolation[];
  /** Contrast failures (WCAG 1.4.3) */
  contrastViolations: ContrastViolation[];
  /** Total elements scanned */
  elementsScanned: number;
  /** Total color claims found */
  colorClaimsFound: number;
  /** Scan duration in ms */
  duration: number;
}

/** Options for the Playwright verify function */
export interface VerifyOptions {
  /** CSS selector to scope the scan. Default: "body" */
  scope?: string;
  /** Check color claims in aria-labels. Default: true */
  checkColorClaims?: boolean;
  /** Check contrast ratios. Default: true */
  checkContrast?: boolean;
  /** CSS properties to check for color claims. Default: ["color", "background-color", "border-color"] */
  cssProperties?: string[];
  /** Sources to check for color words. Default: ["aria-label", "aria-labelledby", "alt", "title"] */
  labelSources?: string[];
  /** Core options passed through to @aria-eyes/core */
  coreOptions?: import("@aria-eyes/core").CoreOptions;
  /** Include passing checks in results (for debugging). Default: false */
  includePasses?: boolean;
}
