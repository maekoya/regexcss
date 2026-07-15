import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tailwindPreset, type TailwindPresetName } from "../src/preset/tailwind/index.ts";
import { typographyPages } from "../src/preset/tailwind/typography/index.ts";
import { createLineClampRules } from "../src/preset/tailwind/typography/line-clamp.ts";
import type { Rule } from "../src/types.ts";
import { match } from "./preset-helpers.ts";

const lineClampRules = createLineClampRules();

// per-category baselines, built through the public API
const colorRules = tailwindPreset({ include: ["color"] });
const flexboxGridRules = tailwindPreset({ include: ["flexbox-grid"] });
const layoutRules = tailwindPreset({ include: ["layout"] });
const sizingRules = tailwindPreset({ include: ["sizing"] });
const spacingRules = tailwindPreset({ include: ["spacing"] });
const typographyRules = tailwindPreset({ include: ["typography"] });

// Rule tuples contain handler closures, so factory output can't be compared by
// reference; a regex-source + label signature pins both content and order.
const signature = (rules: Rule[]) => rules.map(([regex, , meta]) => `${regex.source}|${meta?.label ?? ""}`);

describe("tailwindPreset selection", () => {
  it("with no arguments returns every category in registry order", () => {
    expect(signature(tailwindPreset())).toEqual(
      signature([
        ...colorRules,
        ...flexboxGridRules,
        ...layoutRules,
        ...sizingRules,
        ...spacingRules,
        ...typographyRules,
      ]),
    );
  });

  it("honors the order given in the include array (cascade contract)", () => {
    expect(signature(tailwindPreset({ include: ["typography", "spacing"] }))).toEqual(
      signature([...typographyRules, ...spacingRules]),
    );
    expect(signature(tailwindPreset({ include: ["spacing", "typography"] }))).toEqual(
      signature([...spacingRules, ...typographyRules]),
    );
  });

  it("drops excluded categories from the default set", () => {
    expect(signature(tailwindPreset({ exclude: ["flexbox-grid", "typography"] }))).toEqual(
      signature([...colorRules, ...layoutRules, ...sizingRules, ...spacingRules]),
    );
  });

  it("exclude wins over include, and duplicate include names keep the first occurrence", () => {
    expect(signature(tailwindPreset({ include: ["spacing", "layout"], exclude: ["layout"] }))).toEqual(
      signature(spacingRules),
    );
    expect(signature(tailwindPreset({ include: ["spacing", "spacing"] }))).toEqual(signature(spacingRules));
  });

  it("forwards per-category options to the factories", () => {
    const rules = tailwindPreset({ include: ["spacing"], options: { spacing: { max: 4 } } });
    expect(match("m-4", rules)).toEqual({ margin: "1rem" });
    expect(match("m-5", rules)).toBeUndefined();
  });

  it("generates the same CSS as manually spread aggregates", () => {
    const manual = [...spacingRules, ...layoutRules, ...typographyRules, ...flexboxGridRules];
    const selected = tailwindPreset({ include: ["spacing", "layout", "typography", "flexbox-grid"] });
    for (const token of ["m-2", "p-4", "flex", "grid", "text-center", "gap-2", "z-10", "font-bold"]) {
      expect(match(token, selected), token).toEqual(match(token, manual));
    }
  });

  it("rejects unknown names and mismatched options at the type level", () => {
    // @ts-expect-error -- "nonexistent" is not a TailwindPresetName
    expect(() => tailwindPreset({ include: ["nonexistent"] })).toThrow('Unknown preset "nonexistent"');
    // @ts-expect-error -- spacing options have no `lineClamp` field
    tailwindPreset({ include: ["spacing"], options: { spacing: { lineClamp: { max: 3 } } } });
    // @ts-expect-error -- typography has no category-level options; use "typography/line-clamp"
    tailwindPreset({ include: ["typography"], options: { typography: { lineClamp: { max: 3 } } } });
  });

  it("rejects prototype member names like a plain unknown name", () => {
    expect(() => tailwindPreset({ include: ["toString" as TailwindPresetName] })).toThrow(
      'Unknown preset "toString" (tailwind)',
    );
    expect(() => tailwindPreset({ include: ["constructor/foo" as TailwindPresetName] })).toThrow(
      'Unknown preset page "constructor/foo" (tailwind)',
    );
  });
});

describe("tailwindPreset page-level selection", () => {
  it("includes a single page via its category/page path", () => {
    expect(signature(tailwindPreset({ include: ["typography/line-clamp"] }))).toEqual(signature(lineClampRules));
  });

  it("mixes categories and page paths in the given order", () => {
    expect(signature(tailwindPreset({ include: ["spacing", "typography/line-clamp"] }))).toEqual(
      signature([...spacingRules, ...lineClampRules]),
    );
  });

  it("dedupes a page already emitted by its category (first occurrence wins)", () => {
    expect(signature(tailwindPreset({ include: ["typography", "typography/line-clamp"] }))).toEqual(
      signature(typographyRules),
    );
    // page path first: line-clamp leads, then the rest of typography without a duplicate
    const paged = tailwindPreset({ include: ["typography/line-clamp", "typography"] });
    expect(signature(paged).slice(0, lineClampRules.length)).toEqual(signature(lineClampRules));
    expect(paged.length).toBe(typographyRules.length);
  });

  it("excludes a single page while keeping the rest of its category", () => {
    const rules = tailwindPreset({ include: ["typography"], exclude: ["typography/line-clamp"] });
    expect(match("line-clamp-2", rules)).toBeUndefined();
    expect(match("text-center", rules)).toEqual({ "text-align": "center" });
    expect(rules.length).toBe(typographyRules.length - lineClampRules.length);
  });

  it("forwards page-path options", () => {
    const rules = tailwindPreset({ include: ["typography"], options: { "typography/line-clamp": { max: 3 } } });
    expect(match("line-clamp-3", rules)).toBeDefined();
    expect(match("line-clamp-4", rules)).toBeUndefined();
  });

  it("page-path options override category options page-by-page", () => {
    const rules = tailwindPreset({
      include: ["sizing"],
      options: { sizing: { max: 64 }, "sizing/width": { max: 32 } },
    });
    expect(match("w-32", rules)).toBeDefined();
    expect(match("w-48", rules)).toBeUndefined(); // width capped at 32
    expect(match("h-48", rules)).toBeDefined(); // other axes keep the category cap of 64
    expect(match("h-65", rules)).toBeUndefined();
  });

  it("rejects unknown pages and options for static pages at the type level", () => {
    // @ts-expect-error -- "typography/nope" is not a page path
    expect(() => tailwindPreset({ include: ["typography/nope"] })).toThrow('Unknown preset page "typography/nope"');
    // @ts-expect-error -- text-align is a static page and takes no options
    tailwindPreset({ include: ["typography"], options: { "typography/text-align": { max: 3 } } });
    // @ts-expect-error -- line-clamp options have no `lineClamp` field
    tailwindPreset({ include: ["typography"], options: { "typography/line-clamp": { lineClamp: 3 } } });
  });

  it("throws a descriptive error for a path with an unknown category", () => {
    expect(() => tailwindPreset({ include: ["nope/x" as TailwindPresetName] })).toThrow(
      'Unknown preset page "nope/x" (tailwind)',
    );
  });

  it("validates exclude names too — a typo'd exclusion throws instead of silently no-opping", () => {
    expect(() =>
      tailwindPreset({ include: ["spacing"], exclude: ["spacing/margins" as TailwindPresetName] }),
    ).toThrow('Unknown preset page "spacing/margins" (tailwind)');
  });

  it("ignores explicitly-undefined page option values instead of clobbering category options", () => {
    const rules = tailwindPreset({
      include: ["sizing"],
      options: { sizing: { max: 4 }, "sizing/width": { max: undefined } },
    });
    expect(match("w-4", rules)).toBeDefined();
    expect(match("w-8", rules)).toBeUndefined(); // category cap of 4 survives the undefined override
  });

  it("rejects the retired array shorthand at runtime (plain-JS guard)", () => {
    // @ts-expect-error -- selections are objects, not arrays
    expect(() => tailwindPreset(["spacing"])).toThrow("use { include: [...] }");
  });
});

describe("tailwindPreset.categories", () => {
  it("exposes pages per category; selections return fresh rule sets", () => {
    for (const [category, entry] of Object.entries(tailwindPreset.categories)) {
      expect(Object.keys(entry.pages).length).toBeGreaterThan(0);
      const rules = tailwindPreset({ include: [category as TailwindPresetName] });
      expect(rules.length).toBeGreaterThan(0);
      expect(rules).not.toBe(tailwindPreset({ include: [category as TailwindPresetName] }));
    }
  });

  it("only the shared-max categories carry an option router", () => {
    const routed = Object.entries(tailwindPreset.categories)
      .filter(([, entry]) => "pageOptions" in entry)
      .map(([category]) => category);
    expect(routed).toEqual(["sizing", "spacing"]);
  });

  it("page tables use page file basenames as slugs", () => {
    expect(Object.keys(typographyPages)).toContain("line-clamp");
    expect(Object.keys(tailwindPreset.categories.sizing.pages)).toEqual([
      "width",
      "min-width",
      "max-width",
      "height",
      "min-height",
      "max-height",
      "size",
    ]);
  });

  it("every page-table slug equals its page file basename (by construction on disk)", () => {
    for (const [category, entry] of Object.entries(tailwindPreset.categories)) {
      const files = readdirSync(new URL(`../src/preset/tailwind/${category}/`, import.meta.url))
        .filter((file) => file.endsWith(".ts") && file !== "index.ts" && !file.startsWith("_"))
        .map((file) => file.replace(/\.ts$/, ""))
        .sort();
      expect(Object.keys(entry.pages).sort(), category).toEqual(files);
    }
  });
});
