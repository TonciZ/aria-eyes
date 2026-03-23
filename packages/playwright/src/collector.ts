import type { Page } from "@playwright/test";
import { extractColorClaims } from "@aria-eyes/core";
import type { VerifyOptions } from "./types.js";

export interface CollectedElement {
  selector: string;
  accessibleName: string;
  labelSource: string;
  claims: ReturnType<typeof extractColorClaims>;
  computedStyles: Record<string, string>;
  fontSize: string;
  fontWeight: string;
}

/**
 * Scan the page for elements that have color words in their accessible names.
 * Extract their computed styles for verification.
 *
 * This runs inside the browser context via page.evaluate().
 */
export async function collectElements(
  page: Page,
  options: VerifyOptions = {}
): Promise<CollectedElement[]> {
  const scope = options.scope ?? "body";
  const labelSources = options.labelSources ?? [
    "aria-label",
    "aria-labelledby",
    "alt",
    "title",
  ];
  const cssProperties = options.cssProperties ?? [
    "color",
    "background-color",
    "border-color",
  ];

  // Run in browser context to extract all needed data in one roundtrip
  const rawElements = await page.evaluate(
    ({ scope, labelSources, cssProperties }) => {
      const results: Array<{
        selector: string;
        accessibleName: string;
        labelSource: string;
        computedStyles: Record<string, string>;
        fontSize: string;
        fontWeight: string;
      }> = [];

      const container = document.querySelector(scope);
      if (!container) return results;

      const allElements = container.querySelectorAll("*");

      for (const el of allElements) {
        const htmlEl = el as HTMLElement;

        for (const source of labelSources) {
          let labelText = "";

          if (source === "aria-labelledby") {
            const ids = htmlEl.getAttribute("aria-labelledby");
            if (ids) {
              labelText = ids
                .split(/\s+/)
                .map((id) => document.getElementById(id)?.textContent ?? "")
                .join(" ")
                .trim();
            }
          } else {
            labelText = htmlEl.getAttribute(source) ?? "";
          }

          if (!labelText) continue;

          const computed = window.getComputedStyle(htmlEl);
          const styles: Record<string, string> = {};
          for (const prop of cssProperties) {
            styles[prop] = computed.getPropertyValue(prop);
          }

          // Build a unique-ish selector for reporting
          const selector = buildSelector(htmlEl);

          results.push({
            selector,
            accessibleName: labelText,
            labelSource: source,
            computedStyles: styles,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
          });
        }
      }

      return results;

      function buildSelector(el: Element): string {
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        const classes = Array.from(el.classList).slice(0, 2).join(".");
        const role = el.getAttribute("role");
        const label = el.getAttribute("aria-label");
        if (role) return `${tag}[role="${role}"]${classes ? `.${classes}` : ""}`;
        if (label) return `${tag}[aria-label="${label.slice(0, 30)}"]`;
        if (classes) return `${tag}.${classes}`;
        return tag;
      }
    },
    { scope, labelSources, cssProperties }
  );

  // Now run color claim extraction in Node (not browser) using core
  return rawElements
    .map((el) => ({
      ...el,
      claims: extractColorClaims(
        el.accessibleName,
        options.coreOptions
      ),
    }))
    .filter((el) => el.claims.length > 0);
}
