import { describe, expect, it } from "vitest";
import { escapeSelector } from "../src/core/escape.ts";

describe("escapeSelector", () => {
  it("leaves plain alphanumerics alone", () => {
    expect(escapeSelector("m-1")).toBe("m-1");
  });

  it("escapes colons (variants)", () => {
    expect(escapeSelector("md:m-1")).toBe("md\\:m-1");
  });

  it("escapes dots (decimals)", () => {
    expect(escapeSelector("m-1.5")).toBe("m-1\\.5");
  });

  it("escapes slashes (fractions)", () => {
    expect(escapeSelector("w-1/2")).toBe("w-1\\/2");
  });

  it("escapes multiple meta-chars combined", () => {
    expect(escapeSelector("md:hover:m-1.5")).toBe("md\\:hover\\:m-1\\.5");
  });
});
