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

  it("skips unmatched tokens", async () => {
    const gen = createGenerator({ rules });
    const { matched } = await gen.generate(["unknown-token"]);
    expect(matched.size).toBe(0);
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
