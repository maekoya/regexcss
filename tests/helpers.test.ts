import { describe, expect, it } from "vitest";
import { createVariant, em, parseCustomMedia, pct, px, rem, vh, vw } from "../src/helpers.ts";

describe("rem", () => {
  it("divides by 4 by default (Tailwind-like spacing scale)", () => {
    expect(rem(4)).toBe("1rem");
    expect(rem("4")).toBe("1rem");
    expect(rem(1)).toBe("0.25rem");
    expect(rem("1.5")).toBe("0.375rem");
  });

  it("respects a custom factor", () => {
    expect(rem(16, 16)).toBe("1rem");
    expect(rem(1, 1)).toBe("1rem");
    expect(rem("8", 8)).toBe("1rem");
  });
});

describe("px", () => {
  it("appends the px unit", () => {
    expect(px(1)).toBe("1px");
    expect(px("12")).toBe("12px");
    expect(px("1.5")).toBe("1.5px");
  });
});

describe("em / pct / vw / vh", () => {
  it("appends respective units", () => {
    expect(em(2)).toBe("2em");
    expect(pct(50)).toBe("50%");
    expect(vw(100)).toBe("100vw");
    expect(vh(50)).toBe("50vh");
  });
});

describe("createVariant", () => {
  it("matches the prefix regex", () => {
    const [re] = createVariant("md", { parent: "@media (min-width: 768px)" });
    expect("md:m-4".match(re)).toBeTruthy();
    expect("hover:m-4".match(re)).toBeNull();
    expect("m-4".match(re)).toBeNull();
  });

  it("media-only: parent without selector", () => {
    const [, handler] = createVariant("md", { parent: "@media (min-width: 768px)" });
    const result = handler(["md:"] as unknown as RegExpMatchArray, "md:m-4");
    expect(result).toEqual({
      matcher: "m-4",
      parent: "@media (min-width: 768px)",
    });
  });

  it("pseudo via suffix string", () => {
    const [, handler] = createVariant("hover", { selector: ":hover" });
    const result = handler(["hover:"] as unknown as RegExpMatchArray, "hover:bg-red");
    expect(result?.matcher).toBe("bg-red");
    expect(result?.selector?.(".x")).toBe(".x:hover");
    expect(result?.parent).toBeUndefined();
  });

  it("pseudo via selector function for complex cases", () => {
    const [, handler] = createVariant("group-hover", {
      selector: (s) => `.group:hover ${s}`,
    });
    const result = handler(["group-hover:"] as unknown as RegExpMatchArray, "group-hover:m-4");
    expect(result?.selector?.(".x")).toBe(".group:hover .x");
  });

  it("combines selector and parent (e.g. hover guarded by any-hover)", () => {
    const [, handler] = createVariant("hover", {
      selector: ":hover",
      parent: "@media (any-hover: hover)",
    });
    const result = handler(["hover:"] as unknown as RegExpMatchArray, "hover:bg-red");
    expect(result?.selector?.(".x")).toBe(".x:hover");
    expect(result?.parent).toBe("@media (any-hover: hover)");
  });

  it("supports compound pseudo selectors via string suffix", () => {
    const [, handler] = createVariant("first", { selector: ":first-child" });
    const result = handler(["first:"] as unknown as RegExpMatchArray, "first:m-4");
    expect(result?.selector?.(".x")).toBe(".x:first-child");
  });

  it("supports arbitrary media queries", () => {
    const [, handler] = createVariant("dark", { parent: "@media (prefers-color-scheme: dark)" });
    const result = handler(["dark:"] as unknown as RegExpMatchArray, "dark:bg-black");
    expect(result?.parent).toBe("@media (prefers-color-scheme: dark)");
    expect(result?.selector).toBeUndefined();
  });
});

describe("parseCustomMedia", () => {
  it("extracts @custom-media declarations into a name → query map", () => {
    const css = `
      @custom-media --md (min-width: 768px);
      @custom-media --lg (min-width: 1024px);
    `;
    expect(parseCustomMedia(css)).toEqual({
      "--md": "(min-width: 768px)",
      "--lg": "(min-width: 1024px)",
    });
  });

  it("ignores line comments and trailing whitespace", () => {
    const css = `
      @custom-media --sm (width >= 40rem); /* 640px */
      @custom-media --md (width >= 48rem); /* 768px */
    `;
    expect(parseCustomMedia(css)).toEqual({
      "--sm": "(width >= 40rem)",
      "--md": "(width >= 48rem)",
    });
  });

  it("returns an empty object when no @custom-media is present", () => {
    expect(parseCustomMedia("/* nothing */")).toEqual({});
    expect(parseCustomMedia("")).toEqual({});
    expect(parseCustomMedia(".x { color: red }")).toEqual({});
  });

  it("supports complex range queries", () => {
    const css = `@custom-media --only-md (48rem <= width < 64rem);`;
    expect(parseCustomMedia(css)).toEqual({
      "--only-md": "(48rem <= width < 64rem)",
    });
  });

  it("supports names containing digits and dashes", () => {
    const css = `
      @custom-media --2xl (width >= 96rem);
      @custom-media --max-md (width < 48rem);
    `;
    expect(parseCustomMedia(css)).toEqual({
      "--2xl": "(width >= 96rem)",
      "--max-md": "(width < 48rem)",
    });
  });

  it("ignores @custom-media inside single-line block comments", () => {
    const css = `
      /* @custom-media --md (min-width: 999px); */
      @custom-media --md (min-width: 768px);
    `;
    expect(parseCustomMedia(css)).toEqual({
      "--md": "(min-width: 768px)",
    });
  });

  it("ignores @custom-media inside multi-line block comments", () => {
    const css = `
      /*
        @custom-media --md (min-width: 999px);
        @custom-media --lg (min-width: 1280px);
      */
      @custom-media --md (min-width: 768px);
    `;
    expect(parseCustomMedia(css)).toEqual({
      "--md": "(min-width: 768px)",
    });
  });
});
