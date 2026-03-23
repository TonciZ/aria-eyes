export { verifyColorAccessibility } from "./verify.js";
export { collectElements } from "./collector.js";
export type {
  ColorViolation,
  ContrastViolation,
  VerifyResults,
  VerifyOptions,
} from "./types.js";

// Re-export core for convenience
export {
  extractColorClaims,
  hasColorClaims,
  matchColor,
  hexToBasicColor,
  contrastRatio,
} from "@aria-eyes/core";
