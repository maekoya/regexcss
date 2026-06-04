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
