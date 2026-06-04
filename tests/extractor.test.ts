import { describe, expect, it } from "vitest";
import { defaultExtractor } from "../src/extractor/tokenize.ts";

describe("defaultExtractor", () => {
  it("extracts tokens from HTML class attributes", () => {
    const html = '<div class="m-1 md:m-2 hover:m-3"></div>';
    const tokens = defaultExtractor(html);
    expect(tokens).toContain("m-1");
    expect(tokens).toContain("md:m-2");
    expect(tokens).toContain("hover:m-3");
  });

  it("includes fractional and slash tokens", () => {
    const html = '<div class="w-1/2 m-1.5"></div>';
    const tokens = defaultExtractor(html);
    expect(tokens).toContain("w-1/2");
    expect(tokens).toContain("m-1.5");
  });
});
