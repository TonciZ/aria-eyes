import { describe, it, expect } from "vitest";
import { extractColorClaims, matchColor, contrastRatio } from "@aria-eyes/core";

/**
 * Unit tests for the Playwright package logic.
 * These test the core functions that verify.ts relies on,
 * without requiring an actual browser.
 *
 * Full integration tests with Playwright require a running browser
 * and are better suited for a separate e2e test suite.
 */
describe("playwright verify logic (unit)", () => {
  it("detects color claim in aria-label", () => {
    const claims = extractColorClaims("blue submit button");
    expect(claims).toHaveLength(1);
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("matches correct color claim", () => {
    const result = matchColor("blue", "blue", "rgb(26, 115, 232)");
    expect(result.match).toBe(true);
  });

  it("detects mismatched color claim", () => {
    // Label says "blue" but element is red
    const result = matchColor("blue", "blue", "#ff0000");
    expect(result.match).toBe(false);
    expect(result.actualBasicCategory).toBe("red");
  });

  it("detects low contrast", () => {
    // #cccccc on white
    const result = contrastRatio("#cccccc", "#ffffff");
    expect(result.passesAA).toBe(false);
  });

  it("passes good contrast", () => {
    // #333333 on white
    const result = contrastRatio("#333333", "#ffffff");
    expect(result.passesAA).toBe(true);
  });

  it("handles multiple color claims in one label", () => {
    const claims = extractColorClaims("red and blue warning icon");
    expect(claims).toHaveLength(2);
    expect(claims[0].basicCategory).toBe("red");
    expect(claims[1].basicCategory).toBe("blue");
  });

  it("skips labels without color claims", () => {
    const claims = extractColorClaims("submit form");
    expect(claims).toHaveLength(0);
  });

  it("handles navy as blue", () => {
    const claims = extractColorClaims("navy documentation link");
    expect(claims).toHaveLength(1);
    expect(claims[0].basicCategory).toBe("blue");

    const result = matchColor("navy", "blue", "#000080");
    expect(result.match).toBe(true);
  });
});
