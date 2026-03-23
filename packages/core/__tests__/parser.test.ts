import { describe, it, expect } from "vitest";
import { extractColorClaims, hasColorClaims } from "../src/parser";

describe("extractColorClaims", () => {
  it("extracts a single color word", () => {
    const claims = extractColorClaims("blue button");
    expect(claims).toHaveLength(1);
    expect(claims[0].word).toBe("blue");
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("extracts modified color words", () => {
    const claims = extractColorClaims("dark blue header");
    expect(claims).toHaveLength(1);
    expect(claims[0].word).toBe("dark blue");
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("extracts multiple color words", () => {
    const claims = extractColorClaims("red and green icon");
    expect(claims).toHaveLength(2);
    expect(claims[0].basicCategory).toBe("red");
    expect(claims[1].basicCategory).toBe("green");
  });

  it("returns empty array for no colors", () => {
    const claims = extractColorClaims("submit form");
    expect(claims).toEqual([]);
  });

  it("maps navy to blue", () => {
    const claims = extractColorClaims("navy badge");
    expect(claims).toHaveLength(1);
    expect(claims[0].word).toBe("navy");
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("maps teal to blue", () => {
    const claims = extractColorClaims("teal indicator");
    expect(claims).toHaveLength(1);
    expect(claims[0].word).toBe("teal");
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("maps crimson to red", () => {
    const claims = extractColorClaims("crimson warning");
    expect(claims).toHaveLength(1);
    expect(claims[0].word).toBe("crimson");
    expect(claims[0].basicCategory).toBe("red");
  });

  it("supports custom color map", () => {
    const claims = extractColorClaims("brand-primary label", {
      customColorMap: { "brand-primary": "blue" },
    });
    expect(claims).toHaveLength(1);
    expect(claims[0].basicCategory).toBe("blue");
  });

  it("is case insensitive", () => {
    const claims = extractColorClaims("Blue Button");
    expect(claims).toHaveLength(1);
    expect(claims[0].basicCategory).toBe("blue");
  });
});

describe("hasColorClaims", () => {
  it("returns true for color text", () => {
    expect(hasColorClaims("blue button")).toBe(true);
  });

  it("returns false for non-color text", () => {
    expect(hasColorClaims("submit button")).toBe(false);
  });
});
