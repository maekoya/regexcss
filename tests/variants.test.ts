import { describe, expect, it } from "vitest";
import { applyVariantChain } from "../src/core/variants.ts";
import type { Variant } from "../src/types.ts";

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

describe("applyVariantChain", () => {
  it("returns matcher unchanged when no variant matches", () => {
    const r = applyVariantChain("m-1", variants);
    expect(r.matcher).toBe("m-1");
    expect(r.chain).toHaveLength(0);
  });

  it("strips a single variant prefix and records selector wrap", () => {
    const r = applyVariantChain("hover:m-1", variants);
    expect(r.matcher).toBe("m-1");
    expect(r.chain).toHaveLength(1);
    expect(r.chain[0]?.selector?.(".x")).toBe(".x:hover");
  });

  it("strips a single variant prefix and records parent at-rule", () => {
    const r = applyVariantChain("md:m-1", variants);
    expect(r.matcher).toBe("m-1");
    expect(r.chain[0]?.parent).toBe("@media (--md)");
  });

  it("chains multiple variants in order", () => {
    const r = applyVariantChain("md:hover:m-1", variants);
    expect(r.matcher).toBe("m-1");
    expect(r.chain).toHaveLength(2);
    expect(r.chain[0]?.parent).toBe("@media (--md)");
    expect(r.chain[1]?.selector?.(".x")).toBe(".x:hover");
  });

  it("terminates when no variant matches the remainder", () => {
    const r = applyVariantChain("foo:m-1", variants);
    expect(r.matcher).toBe("foo:m-1");
    expect(r.chain).toHaveLength(0);
  });
});

describe("applyVariantChain — exclusivity groups", () => {
  const grouped: Variant[] = [
    [/^sm:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--sm)", group: "window-size" })],
    [/^md:/, (_, raw) => ({ matcher: raw.slice(3), parent: "@media (--md)", group: "window-size" })],
    [/^hover:/, (_, raw) => ({ matcher: raw.slice(6), selector: (s) => `${s}:hover` })],
  ];

  it("skips a second variant from the same group and reports the collision", () => {
    const r = applyVariantChain("md:sm:m-1", grouped);
    expect(r.chain).toHaveLength(1);
    expect(r.chain[0]?.parent).toBe("@media (--md)");
    // residue keeps the skipped prefix → matches no rule downstream
    expect(r.matcher).toBe("sm:m-1");
    expect(r.collidedGroups).toEqual(["window-size"]);
  });

  it("rejects the same variant applied twice (md:md:)", () => {
    const r = applyVariantChain("md:md:m-1", grouped);
    expect(r.chain).toHaveLength(1);
    expect(r.matcher).toBe("md:m-1");
    expect(r.collidedGroups).toEqual(["window-size"]);
  });

  it("allows stacking variants from different / no groups", () => {
    const r = applyVariantChain("md:hover:m-1", grouped);
    expect(r.chain).toHaveLength(2);
    expect(r.matcher).toBe("m-1");
    expect(r.collidedGroups).toEqual([]);
  });

  it("dedups collisions within a single multi-prefix variant", () => {
    const multi: Variant[] = [
      [
        /^(sm|md|lg):/,
        (m, raw) => ({
          matcher: raw.slice((m[1]?.length ?? 0) + 1),
          parent: `@media (--${m[1]})`,
          group: "window-size",
        }),
      ],
    ];
    const r = applyVariantChain("lg:sm:m-1", multi);
    expect(r.chain).toHaveLength(1);
    expect(r.chain[0]?.parent).toBe("@media (--lg)");
    expect(r.matcher).toBe("sm:m-1");
    expect(r.collidedGroups).toEqual(["window-size"]);
  });

  it("reports no collision for a clean grouped chain", () => {
    const r = applyVariantChain("md:m-1", grouped);
    expect(r.chain).toHaveLength(1);
    expect(r.collidedGroups).toEqual([]);
  });
});
