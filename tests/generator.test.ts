import { describe, expect, it } from "vitest";
import { createGenerator } from "../src/core/generator.ts";
import type { Rule, Variant } from "../src/types.ts";

const rules: Rule[] = [
  [/^m-([.\d]+)$/, ([, num]) => ({ margin: `${num}px` })],
  [/^p-([.\d]+)$/, ([, num]) => ({ padding: `${num}px` })],
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

describe("createGenerator", () => {
  it("produces a simple rule with no variants", async () => {
    const gen = createGenerator({ rules });
    const { css, matched } = await gen.generate(["m-1"]);
    expect(matched.has("m-1")).toBe(true);
    expect(css).toBe(".m-1 { margin: 1px; }");
  });

  it("skips unmatched tokens and reports them", async () => {
    const gen = createGenerator({ rules });
    const { matched, unmatched } = await gen.generate(["unknown-token"]);
    expect(matched.size).toBe(0);
    expect(unmatched.has("unknown-token")).toBe(true);
  });

  it("keeps reporting unmatched tokens on repeated (cached) generate calls", async () => {
    const gen = createGenerator({ rules });
    await gen.generate(["unknown-token"]);
    const { unmatched } = await gen.generate(["unknown-token"]);
    expect(unmatched.has("unknown-token")).toBe(true);
  });

  it("does not report prefix-skipped tokens as unmatched", async () => {
    const gen = createGenerator({ rules, prefix: "tw-" });
    const { unmatched } = await gen.generate(["m-1", "tw-unknown"]);
    expect(unmatched.has("m-1")).toBe(false);
    expect(unmatched.has("tw-unknown")).toBe(true);
  });

  it("applies hover variant as selector wrap", async () => {
    const gen = createGenerator({ rules, variants });
    const { css } = await gen.generate(["hover:m-1"]);
    expect(css).toBe(".hover\\:m-1:hover { margin: 1px; }");
  });

  it("applies md variant as @media wrap", async () => {
    const gen = createGenerator({ rules, variants });
    const { css } = await gen.generate(["md:m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @media (--md) {
        .md\\:m-1 { margin: 1px; }
      }
    `);
  });

  it("composes md + hover variants", async () => {
    const gen = createGenerator({ rules, variants });
    const { css } = await gen.generate(["md:hover:m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @media (--md) {
        .md\\:hover\\:m-1:hover { margin: 1px; }
      }
    `);
  });

  it("wraps everything in @layer when layerName is set", async () => {
    const gen = createGenerator({ rules, layerName: "utilities" });
    const { css } = await gen.generate(["m-1", "p-2"]);
    expect(css).toMatchInlineSnapshot(`
      @layer utilities {
        .m-1 { margin: 1px; }
        .p-2 { padding: 2px; }
      }
    `);
  });

  it("dedups repeated tokens", async () => {
    const gen = createGenerator({ rules });
    const { matched } = await gen.generate(["m-1", "m-1", "m-1"]);
    expect(matched.size).toBe(1);
  });

  it("end-to-end snapshot for mixed input", async () => {
    const gen = createGenerator({ rules, variants, layerName: "utilities" });
    const tokens = ["m-1", "p-2", "md:m-3", "hover:m-4", "bg-red"];
    const { css } = await gen.generate(tokens);
    expect(css).toMatchSnapshot();
  });

  it("emits the same CSS regardless of token discovery order", async () => {
    const tokens = ["m-1", "p-2", "md:m-3", "hover:m-4", "bg-red"];
    const shuffled = ["bg-red", "hover:m-4", "p-2", "md:m-3", "m-1"];
    const a = await createGenerator({ rules, variants }).generate(tokens);
    const b = await createGenerator({ rules, variants }).generate(shuffled);
    expect(b.css).toBe(a.css);
  });

  it("orders output by rule definition, then variant definition (cascade order)", async () => {
    const { css } = await createGenerator({ rules, variants }).generate(["hover:m-1", "p-1", "m-1"]);
    expect(css).toMatchInlineSnapshot(`
      .m-1 { margin: 1px; }
      .p-1 { padding: 1px; }
      .hover\\:m-1:hover { margin: 1px; }
    `);
  });

  it("returns identical CSS from repeated generate calls (memo cache)", async () => {
    const gen = createGenerator({ rules, variants });
    const first = await gen.generate(["md:m-1", "m-2"]);
    const second = await gen.generate(["md:m-1", "m-2"]);
    expect(second.css).toBe(first.css);
    expect(second.matched).toEqual(first.matched);
  });

  it("supports CSSEntries rules (duplicate properties for fallbacks)", async () => {
    const entriesRules: Rule[] = [
      [
        /^stack$/,
        () => [
          ["display", "-webkit-box"],
          ["display", "flex"],
        ],
      ],
    ];
    const { css } = await createGenerator({ rules: entriesRules }).generate(["stack"]);
    expect(css).toBe(".stack { display: -webkit-box; display: flex; }");
  });

  it("drops tokens that stack variants from the same exclusivity group, with a warning", async () => {
    const grouped: Variant[] = [
      [/^sm:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--sm)", group: "window-size" })],
      [/^md:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--md)", group: "window-size" })],
    ];
    const gen = createGenerator({ rules, variants: grouped });
    const { css, matched, unmatched, warnings } = await gen.generate(["md:sm:m-1", "md:m-2"]);
    // the colliding token emits nothing; the clean one is unaffected
    expect(matched.has("md:sm:m-1")).toBe(false);
    expect(unmatched.has("md:sm:m-1")).toBe(true);
    expect(css).not.toContain("md\\:sm");
    expect(css).toContain(".md\\:m-2");
    expect(warnings).toEqual([
      { token: "md:sm:m-1", message: expect.stringContaining('"window-size" used more than once; token ignored') },
    ]);
  });

  it("repeats group-collision warnings from the memo cache on later calls", async () => {
    const grouped: Variant[] = [
      [/^md:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--md)", group: "window-size" })],
    ];
    const gen = createGenerator({ rules, variants: grouped });
    await gen.generate(["md:md:m-1"]);
    const { warnings } = await gen.generate(["md:md:m-1"]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.token).toBe("md:md:m-1");
  });

  it("suppresses the token even when the post-collision residue matches a rule", async () => {
    const grouped: Variant[] = [
      [/^md:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--md)", group: "window-size" })],
    ];
    // pathological: a rule that matches the residue including the leftover prefix
    const greedy: Rule[] = [[/^md:m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]];
    const gen = createGenerator({ rules: greedy, variants: grouped });
    const { css, matched, unmatched, warnings } = await gen.generate(["md:md:m-1"]);
    // no half-applied CSS — a collision always drops the token
    expect(css).toBe("");
    expect(matched.has("md:md:m-1")).toBe(false);
    expect(unmatched.has("md:md:m-1")).toBe(true);
    expect(warnings[0]?.message).toContain("the token was suppressed");
  });

  it("warns when variants applied but the remainder matches no rule (typo)", async () => {
    const gen = createGenerator({ rules, variants });
    const { matched, warnings } = await gen.generate(["hover:m-x", "hover:m-1"]);
    expect(matched.has("hover:m-1")).toBe(true);
    expect(warnings).toEqual([
      { token: "hover:m-x", message: expect.stringContaining(`the remainder "m-x" matched no rule`) },
    ]);
  });

  it("does not warn for unmatched tokens that never went through a variant", async () => {
    const gen = createGenerator({ rules, variants });
    const { unmatched, warnings } = await gen.generate(["totally-random-word"]);
    expect(unmatched.has("totally-random-word")).toBe(true);
    expect(warnings).toEqual([]);
  });

  it("escapes a leading digit in variant-prefixed tokens", async () => {
    const v: Variant[] = [[/^2xl:/, (_, raw) => ({ matcher: raw.slice(4), parent: "@media (--2xl)" })]];
    const { css } = await createGenerator({ rules, variants: v }).generate(["2xl:m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @media (--2xl) {
        .\\32 xl\\:m-1 { margin: 1px; }
      }
    `);
  });

  it("emits @custom-media declarations before the layered body", async () => {
    const gen = createGenerator({
      rules,
      variants,
      layerName: "utilities",
      customMedia: {
        "--md": "(min-width: 768px)",
        "--lg": "(min-width: 1024px)",
      },
    });
    const { css } = await gen.generate(["md:m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @custom-media --md (min-width: 768px);
      @custom-media --lg (min-width: 1024px);

      @layer utilities {
        @media (--md) {
          .md\\:m-1 { margin: 1px; }
        }
      }
    `);
  });

  it("emits only @custom-media when no tokens match", async () => {
    const gen = createGenerator({
      rules,
      customMedia: { "--md": "(min-width: 768px)" },
    });
    const { css } = await gen.generate([]);
    expect(css).toBe("@custom-media --md (min-width: 768px);");
  });

  it("emits nothing when customMedia is empty and no tokens match", async () => {
    const gen = createGenerator({ rules });
    const { css } = await gen.generate([]);
    expect(css).toBe("");
  });

  it("supports per-call layerName override", async () => {
    const gen = createGenerator({ rules, layerName: "default" });
    const { css } = await gen.generate(["m-1"], { layerName: "override" });
    expect(css).toMatchInlineSnapshot(`
      @layer override {
        .m-1 { margin: 1px; }
      }
    `);
  });

  it("falls back to config.layerName when override option is omitted", async () => {
    const gen = createGenerator({ rules, layerName: "default" });
    const { css } = await gen.generate(["m-1"]);
    expect(css).toMatchInlineSnapshot(`
      @layer default {
        .m-1 { margin: 1px; }
      }
    `);
  });

  it("treats empty-string layerName override as no layer", async () => {
    const gen = createGenerator({ rules, layerName: "default" });
    const { css } = await gen.generate(["m-1"], { layerName: "" });
    expect(css).toBe(".m-1 { margin: 1px; }");
  });
});
