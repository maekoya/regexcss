import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createZIndexRules } from "./z-index.ts";

const zIndexRules = createZIndexRules();

describe("z-index", () => {
  it("supports z-auto", () => {
    expect(match("z-auto", zIndexRules)).toEqual({ "z-index": "auto" });
  });

  it("accepts any integer up to the default cap of 10", () => {
    expect(match("z-0", zIndexRules)).toEqual({ "z-index": "0" });
    expect(match("z-5", zIndexRules)).toEqual({ "z-index": "5" });
    expect(match("z-10", zIndexRules)).toEqual({ "z-index": "10" });
    expect(match("z-11", zIndexRules)).toBeUndefined();
    expect(match("z-999", zIndexRules)).toBeUndefined();
  });

  it("supports a custom cap via createZIndexRules", () => {
    const rules = createZIndexRules({ max: 100 });
    expect(match("z-100", rules)).toEqual({ "z-index": "100" });
    expect(match("z-101", rules)).toBeUndefined();
  });

  it("handles negatives via the leading-dash form", () => {
    expect(match("-z-10", zIndexRules)).toEqual({ "z-index": "-10" });
    expect(match("-z-0", zIndexRules)).toEqual({ "z-index": "-0" });
  });

  it.each(["z-", "z--1", "z-1.5", "z-a", "-z-auto", "--z-10", "z-10px"])("rejects %j", (token) => {
    expect(match(token, zIndexRules)).toBeUndefined();
  });
});
