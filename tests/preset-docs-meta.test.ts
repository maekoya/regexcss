import { describe, expect, it } from "vitest";
import { enumerateClasses } from "../src/docs/enumerate.ts";
import { createGapRules } from "../src/preset/tailwind/flexbox-grid/gap.ts";
import { justifyContentRules } from "../src/preset/tailwind/flexbox-grid/justify-content.ts";
import { createOrderRules } from "../src/preset/tailwind/flexbox-grid/order.ts";
import { tailwindPreset, type TailwindPresetName } from "../src/preset/tailwind/index.ts";
import { createMarginRules } from "../src/preset/tailwind/spacing/margin.ts";
import { createPaddingRules } from "../src/preset/tailwind/spacing/padding.ts";
import type { Rule } from "../src/types.ts";

const gapRules = createGapRules();
const orderRules = createOrderRules();
const marginRules = createMarginRules();
const paddingRules = createPaddingRules();

// Sweep every preset category through the docs enumerator. This guards against
// samples drifting from their regexes forever: a dead sample or a rule that became
// non-enumerable shows up here as a warning / empty class list.
const aggregates: Array<[string, Rule[]]> = Object.keys(tailwindPreset.categories).map((category) => [
  category,
  tailwindPreset({ include: [category as TailwindPresetName] }),
]);

describe.each(aggregates)("preset docs metadata — %s", (_name, rules) => {
  const result = enumerateClasses({ rules });

  it("enumerates without warnings", () => {
    expect(result.warnings).toEqual([]);
  });

  it("every rule is enumerable and documents at least one class", () => {
    for (const rule of result.rules) {
      expect(rule.enumerable, `/${rule.source}/ should be enumerable`).toBe(true);
      expect(rule.classes.length, `/${rule.source}/ should document at least one class`).toBeGreaterThan(0);
    }
  });

  it("every rule carries a Tailwind-corresponding label and the preset tag", () => {
    for (const rule of result.rules) {
      expect(rule.label, `/${rule.source}/ should have a label`).toBeTruthy();
      expect(rule.tags, `/${rule.source}/ should be tagged as preset`).toContain("preset");
    }
  });

  it("every documented class has non-empty CSS", () => {
    for (const rule of result.rules) {
      for (const cls of rule.classes) {
        expect(cls.css, `${cls.className} should generate declarations`).not.toBe("");
      }
    }
  });
});

// Presets carry their docs metadata in each rule file, so an individual export used
// on its own (without the category aggregate) still knows its label / tag.
describe("preset docs metadata — individual exports are self-describing", () => {
  it.each<[string, Rule[], string]>([
    ["marginRules", marginRules, "margin"],
    ["paddingRules", paddingRules, "padding"],
    ["gapRules", gapRules, "gap"],
    ["orderRules", orderRules, "order"],
    ["justifyContentRules", justifyContentRules, "justify-content"],
  ])("%s rules each carry label %j and the preset tag", (_name, rules, label) => {
    expect(rules.length).toBeGreaterThan(0);
    for (const [, , meta] of rules) {
      expect(meta?.label).toBe(label);
      expect(meta?.tags).toContain("preset");
    }
  });
});

describe("preset docs metadata — combined aggregate", () => {
  it("enumerates the full preset without warnings", () => {
    const rules = aggregates.flatMap(([, r]) => r);
    const result = enumerateClasses({ rules });
    expect(result.warnings).toEqual([]);
    // samples show verbatim (one row per pattern) and keyword rules enumerate from
    // the regex, so the total is on the order of hundreds, not thousands.
    const total = result.rules.reduce((n, r) => n + r.classes.length, 0);
    expect(total).toBeGreaterThan(100);
  });
});
