import { describe, expect, it } from "vitest";
import { enumerateClasses } from "../src/docs/enumerate.ts";
import { createVariant } from "../src/helpers.ts";
import type { Rule, Variant } from "../src/types.ts";

const names = (result: ReturnType<typeof enumerateClasses>, ruleIndex = 0): string[] =>
  result.rules[ruleIndex]?.classes.map((c) => c.className) ?? [];

describe("enumerateClasses — samples (verbatim)", () => {
  it("emits one class per sample, exactly as authored", () => {
    const rules: Rule[] = [
      [
        /^m-(\d+)$/,
        ([, n]) => ({ margin: `${n}px` }),
        {
          samples: [
            { class: "m-{num}", style: "margin: {num / 4}rem;" },
            { class: "-m-{num}", style: "margin: -{num / 4}rem;" },
          ],
        },
      ],
    ];
    const result = enumerateClasses({ rules });
    expect(result.rules[0]?.classes).toEqual([
      { className: "m-{num}", css: "margin: {num / 4}rem;" },
      { className: "-m-{num}", css: "margin: -{num / 4}rem;" },
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("shows samples verbatim without expanding or verifying them", () => {
    // the style is nonsense the handler would never emit — it still shows as authored
    const rules: Rule[] = [
      [/^m-(\d+)$/, () => ({ margin: "0" }), { samples: [{ class: "m-{num}", style: "anything at all" }] }],
    ];
    const result = enumerateClasses({ rules });
    expect(result.rules[0]?.classes).toEqual([{ className: "m-{num}", css: "anything at all" }]);
    expect(result.warnings).toEqual([]);
  });

  it("prepends config.prefix to sample class names", () => {
    const rules: Rule[] = [
      [/^flex$/, () => ({ display: "flex" }), { samples: [{ class: "flex", style: "display: flex;" }] }],
    ];
    const result = enumerateClasses({ rules, prefix: "u-" });
    expect(names(result)).toEqual(["u-flex"]);
  });

  it("does not regex-expand a rule that has samples", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` }), { samples: [{ class: "m-{num}", style: "margin: …;" }] }],
    ];
    const result = enumerateClasses({ rules }, { maxNumber: 5 });
    expect(names(result)).toEqual(["m-{num}"]);
  });

  it("concrete mode ignores samples and enumerates real class names", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` }), { samples: [{ class: "m-{num}", style: "margin: …;" }] }],
    ];
    const docs = enumerateClasses({ rules }, { maxNumber: 3 });
    expect(names(docs)).toEqual(["m-{num}"]); // sample pattern
    const concrete = enumerateClasses({ rules }, { maxNumber: 3, concrete: true });
    expect(names(concrete)).toEqual(["m-0", "m-1", "m-2", "m-3"]); // real classes with CSS
    expect(concrete.rules[0]?.classes[0]?.css).toBe("margin: 0px;");
  });
});

describe("enumerateClasses — regex fallback (no samples)", () => {
  it("expands literal patterns", () => {
    const rules: Rule[] = [[/^flex$/, () => ({ display: "flex" })]];
    const result = enumerateClasses({ rules });
    expect(names(result)).toEqual(["flex"]);
    expect(result.rules[0]?.classes[0]?.css).toBe("display: flex;");
  });

  it("expands group alternation", () => {
    const rules: Rule[] = [[/^text-(left|right|center)$/, ([, v]) => ({ "text-align": v ?? "" })]];
    const result = enumerateClasses({ rules });
    expect(names(result)).toEqual(["text-left", "text-right", "text-center"]);
  });

  it("expands optional atoms", () => {
    const rules: Rule[] = [[/^(mx?)-1$/, () => ({ margin: "1px" })]];
    const result = enumerateClasses({ rules });
    expect(names(result)).toEqual(["m-1", "mx-1"]);
  });

  it("expands small character classes and ranges", () => {
    const rules: Rule[] = [[/^m[xy]-[1-3]$/, () => ({ margin: "1px" })]];
    const result = enumerateClasses({ rules });
    expect(names(result)).toEqual(["mx-1", "mx-2", "mx-3", "my-1", "my-2", "my-3"]);
  });

  it("bounds \\d+ by maxNumber", () => {
    const rules: Rule[] = [[/^z-(\d+)$/, ([, n]) => ({ "z-index": n ?? "" })]];
    const result = enumerateClasses({ rules }, { maxNumber: 3 });
    expect(names(result)).toEqual(["z-0", "z-1", "z-2", "z-3"]);
  });

  it("bails on open-ended patterns and reports them as non-enumerable", () => {
    const rules: Rule[] = [
      [/^bg-(\w+)$/, () => ({ background: "red" })],
      [/^a(?=b)b$/, () => ({ order: "0" })],
      [/^c{2,}$/, () => ({ order: "0" })],
    ];
    const result = enumerateClasses({ rules });
    for (const rule of result.rules) {
      expect(rule.enumerable).toBe(false);
      expect(rule.classes).toEqual([]);
    }
    expect(result.warnings).toHaveLength(3);
    expect(result.warnings[0]).toContain("add `samples`");
  });

  it("caps a rule at 100 classes in the docs and warns (keeping the shown ones)", () => {
    // (\d+)-(\d+) with maxNumber 12 → 13 × 13 = 169 concrete classes
    const rules: Rule[] = [[/^x-(\d+)-(\d+)$/, ([, a, b]) => ({ order: `${a}${b}` })]];
    const result = enumerateClasses({ rules }, { maxNumber: 12 });
    expect(result.rules[0]?.classes).toHaveLength(100);
    expect(result.rules[0]?.enumerable).toBe(true);
    expect(result.warnings[0]).toContain("capped at 100 of 169 classes");
  });

  it("does not warn or cap a rule that stays under 100 classes", () => {
    const rules: Rule[] = [[/^z-(\d+)$/, ([, n]) => ({ "z-index": n ?? "" })]];
    const result = enumerateClasses({ rules }, { maxNumber: 12 });
    expect(result.rules[0]?.classes).toHaveLength(13);
    expect(result.warnings).toEqual([]);
  });

  it("respects a custom maxClassesPerRule and disables the cap with 0", () => {
    const rules: Rule[] = [[/^x-(\d+)-(\d+)$/, ([, a, b]) => ({ order: `${a}${b}` })]];
    const capped = enumerateClasses({ rules }, { maxNumber: 12, maxClassesPerRule: 10 });
    expect(capped.rules[0]?.classes).toHaveLength(10);
    expect(capped.warnings[0]).toContain("capped at 10 of 169 classes");

    const uncapped = enumerateClasses({ rules }, { maxNumber: 12, maxClassesPerRule: 0 });
    expect(uncapped.rules[0]?.classes).toHaveLength(169);
    expect(uncapped.warnings).toEqual([]);
  });

  it("enumerates a large-but-finite rule instead of bailing", () => {
    // 13 × 13 × 13 = 2197 combos — under the enumeration ceiling, so it enumerates
    const rules: Rule[] = [[/^g-(\d+)-(\d+)-(\d+)$/, () => ({ order: "0" })]];
    const result = enumerateClasses({ rules }, { maxNumber: 12 });
    expect(result.rules[0]?.enumerable).toBe(true);
    expect(result.rules[0]?.classes).toHaveLength(100);
    expect(result.warnings[0]).toContain("capped at 100 of 2197 classes");
  });

  it("drops candidates the handler rejects", () => {
    const rules: Rule[] = [[/^m-(x|1)$/, ([, v]) => (v === "1" ? { margin: "1px" } : undefined)]];
    const result = enumerateClasses({ rules });
    expect(names(result)).toEqual(["m-1"]);
    expect(result.warnings).toEqual([]);
  });
});

describe("enumerateClasses — attribution", () => {
  it("dedupes globally and attributes classes to the first matching rule", () => {
    const rules: Rule[] = [
      [/^m-1$/, () => ({ margin: "special" })],
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })],
    ];
    const result = enumerateClasses({ rules }, { maxNumber: 2 });
    expect(names(result, 0)).toEqual(["m-1"]);
    expect(result.rules[0]?.classes[0]?.css).toBe("margin: special;");
    expect(names(result, 1)).toEqual(["m-0", "m-2"]);
  });

  it("does not leak regex candidates into a sample-documented rule", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` }), { samples: [{ class: "m-{num}", style: "margin: …;" }] }],
      // no samples, regex-expands m-1 / m-2 — but both match the sample rule first
      [/^m-(1|2)$/, () => ({ margin: "never" })],
    ];
    const result = enumerateClasses({ rules }, { maxNumber: 5 });
    expect(names(result, 0)).toEqual(["m-{num}"]);
    expect(names(result, 1)).toEqual([]);
  });

  it("documents variants by overview, deriving a note from createVariant", () => {
    const rules: Rule[] = [[/^flex$/, () => ({ display: "flex" })]];
    const variants: Variant[] = [
      createVariant("md", { parent: "@media (--md)", group: "window-size" }),
      createVariant("hover", { selector: ":hover" }),
      [/^dark:/, (_, raw) => ({ matcher: raw.slice(5) })], // hand-written, no meta
    ];
    const result = enumerateClasses({ rules, variants });
    expect(result.variants).toEqual([
      {
        label: "md",
        source: "^md:",
        group: "window-size",
        note: "@media (--md)",
        sample: "@media (--md) {\n  .md\\:<utility> { … }\n}",
      },
      {
        label: "hover",
        source: "^hover:",
        group: undefined,
        note: "&:hover",
        sample: ".hover\\:<utility>:hover { … }",
      },
      { label: "^dark:", source: "^dark:", group: undefined, note: undefined, sample: undefined },
    ]);
  });

  it("documents object-form variants with the same derived meta as createVariant", () => {
    const rules: Rule[] = [[/^flex$/, () => ({ display: "flex" })]];
    const result = enumerateClasses({
      rules,
      variants: [{ prefix: "md", parent: "@media (--md)", group: "window-size" }],
    });
    expect(result.variants).toEqual([
      {
        label: "md",
        source: "^md:",
        group: "window-size",
        note: "@media (--md)",
        sample: "@media (--md) {\n  .md\\:<utility> { … }\n}",
      },
    ]);
  });

  it("returns no variants when the config has none", () => {
    const result = enumerateClasses({ rules: [[/^flex$/, () => ({ display: "flex" })]] });
    expect(result.variants).toEqual([]);
  });

  it("excludes hidden rules from the output entirely", () => {
    const rules: Rule[] = [
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` }), { label: "margin" }],
      [/^text-black$/, () => ({ color: "black" }), { label: "text-black", hidden: true }],
    ];
    const result = enumerateClasses({ rules }, { maxNumber: 2 });
    expect(result.rules.map((r) => r.label)).toEqual(["margin"]);
  });

  it("does not leak a hidden rule's classes into another rule", () => {
    const rules: Rule[] = [
      [/^m-1$/, () => ({ margin: "special" }), { hidden: true }],
      // no samples → regex-expands m-0, m-1, m-2; but m-1 matches the hidden rule first
      [/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })],
    ];
    const result = enumerateClasses({ rules }, { maxNumber: 2 });
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0]?.classes.map((c) => c.className)).toEqual(["m-0", "m-2"]);
  });

  it("keeps category, label, tags, and note metadata on the doc rule", () => {
    const rules: Rule[] = [
      [
        /^flex$/,
        () => ({ display: "flex" }),
        { category: "layout", label: "display", tags: ["preset"], note: "see MDN for details" },
      ],
      [/^grow$/, () => ({ "flex-grow": "1" })],
    ];
    const result = enumerateClasses({ rules });
    expect(result.rules[0]?.category).toBe("layout");
    expect(result.rules[0]?.label).toBe("display");
    expect(result.rules[0]?.tags).toEqual(["preset"]);
    expect(result.rules[0]?.note).toBe("see MDN for details");
    expect(result.rules[1]?.label).toBeUndefined();
    expect(result.rules[1]?.tags).toEqual([]);
    expect(result.rules[1]?.note).toBeUndefined();
  });
});
