import { describe, it, expect } from "vitest";
import { contrastRatio } from "../src/contrast";

describe("contrastRatio", () => {
  it("calculates max contrast for black on white", () => {
    const result = contrastRatio("#000000", "#ffffff");
    expect(result.ratio).toBe(21);
    expect(result.passesAA).toBe(true);
    expect(result.passesAALarge).toBe(true);
    expect(result.passesAAA).toBe(true);
    expect(result.passesAAALarge).toBe(true);
  });

  it("calculates min contrast for same colors", () => {
    const result = contrastRatio("#ffffff", "#ffffff");
    expect(result.ratio).toBe(1);
    expect(result.passesAA).toBe(false);
    expect(result.passesAALarge).toBe(false);
  });

  it("checks AA pass/fail for gray on white", () => {
    const result = contrastRatio("#777777", "#ffffff");
    expect(result.ratio).toBeGreaterThan(4);
    expect(result.ratio).toBeLessThan(5);
    // #777 on white is about 4.48:1, fails AA normal but passes AA large
    expect(result.passesAALarge).toBe(true);
  });

  it("handles rgb() input", () => {
    const result = contrastRatio("rgb(0,0,0)", "rgb(255,255,255)");
    expect(result.ratio).toBe(21);
  });
});
