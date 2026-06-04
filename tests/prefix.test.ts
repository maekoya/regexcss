import { describe, expect, it } from "vitest";
import { createGenerator } from "../src/core/generator.ts";
import type { Rule, Variant } from "../src/types.ts";

const rules: Rule[] = [
  [/^m-([.\d]+)$/, ([, num]) => ({ margin: `${num}px` })],
  [/^bg-(\w+)$/, ([, color]) => ({ backgroundColor: color ?? "" })],
];

const variants: Variant[] = [
  [/^md:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--md)" })],
  [
    /^hover:/,
    (_, raw) => ({
      matcher: raw.slice(6),
      selector: (s) => `${s}:hover`,
    }),
  ],
];

describe("prefix gate", () => {
  it("generates CSS for prefixed token", async () => {
    const gen = createGenerator({ rules, prefix: "tw-" });
    const { css, matched } = await gen.generate(["tw-m-1"]);
    expect(matched.has("tw-m-1")).toBe(true);
    expect(css).toBe(".tw-m-1 { margin: 1px; }");
  });

  it("skips bare tokens when prefix is set", async () => {
    const gen = createGenerator({ rules, prefix: "tw-" });
    const { css, matched } = await gen.generate(["m-1"]);
    expect(matched.size).toBe(0);
    expect(css).toBe("");
  });

  it("composes prefix + single variant", async () => {
    const gen = createGenerator({ rules, variants, prefix: "tw-" });
    const { css } = await gen.generate(["tw-md:m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @media (--md) {
        .tw-md\\:m-1 { margin: 1px; }
      }
    `);
  });

  it("composes prefix + multi-variant chain", async () => {
    const gen = createGenerator({ rules, variants, prefix: "tw-" });
    const { css } = await gen.generate(["tw-md:hover:m-4"]);
    expect(css).toMatchInlineSnapshot(`
      @media (--md) {
        .tw-md\\:hover\\:m-4:hover { margin: 4px; }
      }
    `);
  });

  it("unchanged behavior when prefix is unset", async () => {
    const gen = createGenerator({ rules });
    const { css, matched } = await gen.generate(["m-1"]);
    expect(matched.has("m-1")).toBe(true);
    expect(css).toBe(".m-1 { margin: 1px; }");
  });

  it("filters mixed inputs to prefixed only", async () => {
    const gen = createGenerator({ rules, prefix: "tw-" });
    const { matched } = await gen.generate(["tw-m-1", "m-1", "tw-bg-red", "p-2"]);
    expect(matched).toEqual(new Set(["tw-m-1", "tw-bg-red"]));
  });

  it("empty prefix string behaves as unset", async () => {
    const gen = createGenerator({ rules, prefix: "" });
    const { css, matched } = await gen.generate(["m-1"]);
    expect(matched.has("m-1")).toBe(true);
    expect(css).toBe(".m-1 { margin: 1px; }");
  });
});
