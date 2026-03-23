import type { Page } from "@playwright/test";
import { matchColor, contrastRatio } from "@aria-eyes/core";
import { collectElements } from "./collector.js";
import type {
  VerifyOptions,
  VerifyResults,
  ColorViolation,
  ContrastViolation,
} from "./types.js";

/**
 * Verify color claims and contrast on a page.
 *
 * This is the main entry point for Playwright users.
 */
export async function verifyColorAccessibility(
  page: Page,
  options: VerifyOptions = {}
): Promise<VerifyResults> {
  const startTime = Date.now();
  const checkColorClaims = options.checkColorClaims ?? true;
  const checkContrast = options.checkContrast ?? true;

  const colorViolations: ColorViolation[] = [];
  const contrastViolations: ContrastViolation[] = [];

  // Collect elements with color claims
  const elements = await collectElements(page, options);

  if (checkColorClaims) {
    for (const el of elements) {
      for (const claim of el.claims) {
        // Check each CSS property for a match
        for (const [prop, value] of Object.entries(el.computedStyles)) {
          if (!value || value === "rgba(0, 0, 0, 0)") continue; // transparent

          const result = matchColor(
            claim.word,
            claim.basicCategory,
            value,
            options.coreOptions
          );

          if (!result.match || options.includePasses) {
            colorViolations.push({
              selector: el.selector,
              accessibleName: el.accessibleName,
              colorClaim: claim.word,
              cssProperty: prop,
              computedValue: value,
              matchResult: result,
              wcag: "1.4.1",
              message: result.match
                ? `PASS: "${claim.word}" matches ${prop} (${result.actualBasicCategory})`
                : `FAIL: Label claims "${claim.word}" but ${prop} is ${result.actualBasicCategory} (${value})`,
            });
          }
        }
      }
    }
  }

  if (checkContrast) {
    // Contrast checking: scan ALL text elements, not just those with claims
    const contrastData = await page.evaluate(
      ({ scope }) => {
        const container = document.querySelector(scope ?? "body");
        if (!container) return [];

        const results: Array<{
          selector: string;
          color: string;
          backgroundColor: string;
          fontSize: string;
          fontWeight: string;
        }> = [];

        // Walk text nodes to find elements with actual text content
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null
        );

        const seen = new Set<Element>();
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const el = node.parentElement;
          if (!el || seen.has(el)) continue;
          if (!node.textContent?.trim()) continue;
          seen.add(el);

          const computed = window.getComputedStyle(el);

          // Walk up to find effective background color
          let bg = computed.backgroundColor;
          let parent = el.parentElement;
          while (
            parent &&
            (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")
          ) {
            bg = window.getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
          }
          if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
            bg = "rgb(255, 255, 255)"; // assume white
          }

          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : "";
          const cls = el.className
            ? `.${String(el.className).split(" ").slice(0, 2).join(".")}`
            : "";

          results.push({
            selector: `${tag}${id}${cls}`,
            color: computed.color,
            backgroundColor: bg,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
          });
        }

        return results;
      },
      { scope: options.scope }
    );

    for (const el of contrastData) {
      const result = contrastRatio(el.color, el.backgroundColor);

      const fontSizePx = parseFloat(el.fontSize);
      const fontWeightNum = parseInt(el.fontWeight, 10) || 400;
      const isLargeText =
        fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeightNum >= 700);

      const passes = isLargeText ? result.passesAALarge : result.passesAA;

      if (!passes) {
        contrastViolations.push({
          selector: el.selector,
          foreground: el.color,
          background: el.backgroundColor,
          contrastResult: result,
          fontSize: el.fontSize,
          fontWeight: el.fontWeight,
          isLargeText,
          wcag: "1.4.3",
          message: `Contrast ratio ${result.ratio}:1 fails WCAG AA${isLargeText ? " (large text)" : ""} for ${el.selector}. Need ${isLargeText ? "3" : "4.5"}:1, got ${result.ratio}:1.`,
        });
      }
    }
  }

  return {
    colorViolations,
    contrastViolations,
    elementsScanned: elements.length,
    colorClaimsFound: elements.reduce((sum, el) => sum + el.claims.length, 0),
    duration: Date.now() - startTime,
  };
}
