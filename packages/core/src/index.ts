export { extractColorClaims, hasColorClaims, getColorMap } from "./parser.js";
export { matchColor, hexToBasicColor, cssColorToHex } from "./color-match.js";
export { contrastRatio } from "./contrast.js";
export type {
  ColorClaim,
  ColorMatchResult,
  ContrastResult,
  CoreOptions,
} from "./types.js";
