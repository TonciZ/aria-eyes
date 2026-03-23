import { describe, it, expect } from "vitest";
import { hexToBasicColor, cssColorToHex, matchColor } from "../src/color-match";

describe("hexToBasicColor", () => {
  it("identifies blue", () => {
    expect(hexToBasicColor("#0000ff")).toBe("blue");
  });

  it("identifies red", () => {
    expect(hexToBasicColor("#ff0000")).toBe("red");
  });

  it("maps teal to blue", () => {
    expect(hexToBasicColor("#008080")).toBe("blue");
  });

  it("identifies purple", () => {
    expect(hexToBasicColor("#800080")).toBe("purple");
  });

  it("identifies gray", () => {
    expect(hexToBasicColor("#808080")).toBe("gray");
  });

  it("identifies white", () => {
    expect(hexToBasicColor("#ffffff")).toBe("white");
  });

  it("identifies black", () => {
    expect(hexToBasicColor("#000000")).toBe("black");
  });

  it("identifies orange", () => {
    expect(hexToBasicColor("#ffa500")).toBe("orange");
  });
});

describe("cssColorToHex", () => {
  it("converts rgb() to hex", () => {
    expect(cssColorToHex("rgb(255, 0, 0)")).toBe("#ff0000");
  });

  it("expands shorthand hex", () => {
    expect(cssColorToHex("#f00")).toBe("#ff0000");
  });

  it("strips alpha from 8-digit hex", () => {
    expect(cssColorToHex("#ff000080")).toBe("#ff0000");
  });

  it("passes through 6-digit hex", () => {
    expect(cssColorToHex("#1a73e8")).toBe("#1a73e8");
  });
});

describe("matchColor", () => {
  it("matches blue claim to blue hex", () => {
    const result = matchColor("blue", "blue", "#1a73e8");
    expect(result.match).toBe(true);
  });

  it("fails blue claim against red hex", () => {
    const result = matchColor("blue", "blue", "#ff0000");
    expect(result.match).toBe(false);
    expect(result.confidence).toBe("mismatch");
  });

  it("handles rgb() input", () => {
    const result = matchColor("red", "red", "rgb(255, 0, 0)");
    expect(result.match).toBe(true);
  });

  it("handles rgba() input", () => {
    const result = matchColor("green", "green", "rgba(0, 128, 0, 1)");
    expect(result.match).toBe(true);
  });
});
