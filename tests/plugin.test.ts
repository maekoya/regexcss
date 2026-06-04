import { describe, expect, it } from "vitest";

// Mirror of `CSS_IMPORT_RE` in src/plugin/vite.ts.
// Keep the two in sync if either changes.
const CSS_IMPORT_RE = /@import\s+["']regexcss["'](?:\s+layer\(([^)]+)\))?;?/g;

const matches = (code: string) => [...code.matchAll(CSS_IMPORT_RE)];

describe("CSS @import 'regexcss' regex", () => {
  it("matches basic import with double quotes", () => {
    const result = matches(`@import "regexcss";`);
    expect(result).toHaveLength(1);
    expect(result[0]?.[1]).toBeUndefined();
  });

  it("matches basic import with single quotes", () => {
    const result = matches(`@import 'regexcss';`);
    expect(result).toHaveLength(1);
    expect(result[0]?.[1]).toBeUndefined();
  });

  it("matches import without trailing semicolon", () => {
    const result = matches(`@import "regexcss"`);
    expect(result).toHaveLength(1);
  });

  it("captures layer(name) without quotes", () => {
    const result = matches(`@import "regexcss" layer(website.utilities);`);
    expect(result[0]?.[1]).toBe("website.utilities");
  });

  it("captures layer(name) with double quotes", () => {
    const result = matches(`@import "regexcss" layer("website.utilities");`);
    expect(result[0]?.[1]).toBe(`"website.utilities"`);
  });

  it("captures layer(name) with single quotes", () => {
    const result = matches(`@import "regexcss" layer('website.utilities');`);
    expect(result[0]?.[1]).toBe(`'website.utilities'`);
  });

  it("matches multiple imports with distinct layers in one file", () => {
    const code = `
      @import "regexcss" layer(a);
      @import "regexcss" layer(b);
      @import "regexcss";
    `;
    const result = matches(code);
    expect(result).toHaveLength(3);
    expect(result[0]?.[1]).toBe("a");
    expect(result[1]?.[1]).toBe("b");
    expect(result[2]?.[1]).toBeUndefined();
  });

  it("does not match unrelated CSS imports", () => {
    const result = matches(`@import "./other.css";`);
    expect(result).toHaveLength(0);
  });

  it("does not match a different package name", () => {
    const result = matches(`@import "regexcss-extra";`);
    expect(result).toHaveLength(0);
  });

  it("does not match a subpath import", () => {
    const result = matches(`@import "regexcss/foo";`);
    expect(result).toHaveLength(0);
  });
});

describe("layer override stripping", () => {
  // Mirrors the trim + quote-removal logic in src/plugin/vite.ts transform hook.
  const strip = (raw: string | undefined): string | undefined => raw?.trim().replace(/^["']|["']$/g, "");

  it("returns undefined for missing override", () => {
    expect(strip(undefined)).toBeUndefined();
  });

  it("returns unquoted name as-is", () => {
    expect(strip("website.utilities")).toBe("website.utilities");
  });

  it("strips double quotes", () => {
    expect(strip(`"website.utilities"`)).toBe("website.utilities");
  });

  it("strips single quotes", () => {
    expect(strip(`'website.utilities'`)).toBe("website.utilities");
  });

  it("trims surrounding whitespace", () => {
    expect(strip("  layered  ")).toBe("layered");
  });
});
