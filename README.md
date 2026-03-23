# aria-eyes

**Automated color claim verification for accessibility testing.** Verify that aria-labels and alt text actually match the visual appearance of UI elements.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)

> If aria-eyes helps your accessibility workflow, give it a star. It helps others find the project and keeps development active.

**[Live Demo](https://tonciz.github.io/aria-eyes/)** — See aria-eyes catch color claim mismatches in real time.

## Why aria-eyes? What gap does it fill?

Tools like axe-core, Lighthouse, and pa11y can check contrast ratios and find missing aria-labels. But when an aria-label says "blue button" or alt text says "red warning icon", **no tool verifies the color claim is actually true**.

If the label says "blue" but the button is red, a screen reader user gets wrong information about the interface. aria-eyes catches these mismatches automatically.

### What can axe-core, Lighthouse, and pa11y check?

- Color contrast ratios (WCAG 1.4.3)
- Missing aria-labels and alt text
- Structural ARIA issues

### What can only aria-eyes check?

- Does `aria-label="blue button"` actually have a blue background? (WCAG 1.4.1)
- Does `alt="red warning icon"` match a red-colored icon? (WCAG 1.1.1)
- Do color words in accessible names match the rendered CSS colors?

aria-eyes is **not a replacement** for axe-core or Lighthouse. It fills the gap they leave open.

## Packages

| Package | Description | Install |
|---------|------------|---------|
| [`@aria-eyes/core`](packages/core) | Framework-agnostic color claim parsing, matching, and contrast. Zero browser dependencies. Works with Cypress, Selenium, WebdriverIO, or plain Node. | `npm i @aria-eyes/core` |
| [`@aria-eyes/playwright`](packages/playwright) | Playwright plugin for full-page automated color accessibility scanning. | `npm i @aria-eyes/playwright` |

## Quick Start

### Verify color claims with Playwright

```bash
npm install @aria-eyes/playwright
```

```typescript
import { test, expect } from "@playwright/test";
import { verifyColorAccessibility } from "@aria-eyes/playwright";

test("accessible color claims match visual appearance", async ({ page }) => {
  await page.goto("https://example.com");
  const results = await verifyColorAccessibility(page);

  // No color claim mismatches (WCAG 1.4.1)
  expect(results.colorViolations).toEqual([]);

  // No contrast failures (WCAG 1.4.3)
  expect(results.contrastViolations).toEqual([]);
});
```

### Use the core library in any framework

```bash
npm install @aria-eyes/core
```

```typescript
import { extractColorClaims, matchColor, contrastRatio } from "@aria-eyes/core";

// 1. Find color words in an aria-label or alt text
const claims = extractColorClaims("blue submit button");
// [{ word: "blue", basicCategory: "blue", startIndex: 0, endIndex: 4 }]

// 2. Verify a color claim against the actual CSS color
const result = matchColor("blue", "blue", "#1a73e8");
// { match: true, confidence: "exact", actualBasicCategory: "blue" }

const mismatch = matchColor("blue", "blue", "#ff0000");
// { match: false, confidence: "mismatch", actualBasicCategory: "red" }

// 3. Check WCAG contrast ratio
const contrast = contrastRatio("#333333", "#ffffff");
// { ratio: 12.63, passesAA: true, passesAAA: true }
```

## How does aria-eyes verify color claims?

1. **Parse** — Scans aria-labels, alt text, and title attributes for color words using a built-in dictionary of 70+ color names (e.g. "teal" maps to "blue", "crimson" maps to "red")
2. **Extract** — Gets the computed CSS color from the actual rendered element
3. **Match** — Converts the CSS color to a basic color category using [color-namer](https://www.npmjs.com/package/color-namer) and compares it to the claimed color
4. **Report** — Returns match status, confidence level ("exact", "close", "mismatch"), and both claimed and actual color categories

## WCAG Success Criteria Coverage

| WCAG Criterion | Name | What aria-eyes checks |
|---------------|------|----------------------|
| 1.4.1 | Use of Color | Verifies color words in aria-labels match the rendered CSS colors |
| 1.1.1 | Non-text Content | Checks alt text color descriptions against actual element colors |
| 1.4.3 | Contrast (Minimum) | Calculates contrast ratios and checks AA/AAA compliance |

## Core API Reference

### `extractColorClaims(text, options?): ColorClaim[]`

Extract color words from any string. Handles single colors ("blue button"), modified colors ("dark blue header"), and multiple colors ("red and green icon").

### `hasColorClaims(text, options?): boolean`

Quick check for whether a string contains any color words.

### `matchColor(claimedColor, claimedBasicCategory, actualCssColor, options?): ColorMatchResult`

Compare a claimed color name against an actual CSS color value. Returns match status and confidence.

### `hexToBasicColor(hex): string`

Convert any hex color to its basic color category (e.g. "#008080" returns "blue").

### `cssColorToHex(cssColor): string`

Parse hex, rgb(), or rgba() CSS color strings to a normalized 6-digit hex value.

### `contrastRatio(foreground, background): ContrastResult`

Calculate WCAG 2.1 contrast ratio with pass/fail for AA, AA Large, AAA, and AAA Large.

## Playwright API Reference

### `verifyColorAccessibility(page, options?): Promise<VerifyResults>`

Full-page scan for color claim mismatches and contrast failures.

| Option | Default | Description |
|--------|---------|-------------|
| `scope` | `"body"` | CSS selector to limit the scan area |
| `checkColorClaims` | `true` | Verify color words in labels against CSS |
| `checkContrast` | `true` | Check WCAG contrast ratios |
| `cssProperties` | `["color", "background-color", "border-color"]` | CSS properties to check for color matches |
| `labelSources` | `["aria-label", "aria-labelledby", "alt", "title"]` | Attributes to scan for color words |
| `coreOptions` | `{}` | Options passed through to core functions |
| `includePasses` | `false` | Include passing checks in results |

### `collectElements(page, options?): Promise<CollectedElement[]>`

Lower-level function to find elements with color claims without running verification. Useful for building custom reporting.

## Using aria-eyes with Cypress, Selenium, and other frameworks

The core package works in any JavaScript environment. Extract the element's accessible name and computed color using your framework, then pass them to `matchColor()`.

### Cypress example

```typescript
import { extractColorClaims, matchColor } from "@aria-eyes/core";

describe("Color accessibility", () => {
  it("verifies color claims in aria-labels", () => {
    cy.visit("/");
    cy.get("[aria-label]").each(($el) => {
      const label = $el.attr("aria-label");
      const claims = extractColorClaims(label);

      if (claims.length > 0) {
        const computedColor = window.getComputedStyle($el[0]).color;
        for (const claim of claims) {
          const result = matchColor(claim.word, claim.basicCategory, computedColor);
          expect(result.match).to.be.true;
        }
      }
    });
  });
});
```

### Selenium / WebdriverIO

Install `@aria-eyes/core`, extract the element's aria-label and computed color in your framework, then call `matchColor()`. The core library has zero browser dependencies.

## Custom color vocabulary

Extend the built-in color dictionary with brand-specific or domain-specific terms:

```typescript
// Playwright
const results = await verifyColorAccessibility(page, {
  coreOptions: {
    customColorMap: {
      "brand-blue": "blue",
      "accent": "orange",
      "primary": "blue",
      "danger": "red",
      "success": "green",
    },
  },
});

// Core
const claims = extractColorClaims("brand-blue header", {
  customColorMap: { "brand-blue": "blue" },
});
```

## Built-in color recognition

aria-eyes recognizes 70+ color names out of the box, mapped to basic categories:

| Category | Recognized words |
|----------|-----------------|
| Red | red, crimson, scarlet, maroon, ruby, burgundy, vermilion |
| Blue | blue, navy, teal, cyan, azure, cobalt, indigo, cerulean, sapphire |
| Green | green, lime, olive, emerald, mint, sage, forest, jade |
| Purple | purple, violet, lavender, magenta, plum, mauve, lilac, amethyst, fuchsia |
| Orange | orange, coral, salmon, peach, tangerine, amber |
| Yellow | yellow, gold, golden, cream, beige |
| Pink | pink, rose, blush |
| Brown | brown, tan, chocolate, coffee, sienna, umber, khaki |
| Gray | gray, grey, charcoal, silver, slate, ash |
| Black | black |
| White | white, ivory |

Color modifiers like "dark", "light", "bright", "pale", "deep", and "vivid" are also recognized (e.g. "dark blue" maps to "blue").

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes with `npm run build && npm test` from the root
4. Submit a PR

## License

[MIT](LICENSE)
