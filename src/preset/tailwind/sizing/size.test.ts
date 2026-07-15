import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createSizeRules } from "./size.ts";

const sizeRules = createSizeRules();

describe("preset sizing — size", () => {
  it.each([
    ["size-4", { width: "1rem", height: "1rem" }],
    ["size-full", { width: "100%", height: "100%" }],
    ["size-1/2", { width: "calc(1/2 * 100%)", height: "calc(1/2 * 100%)" }],
    ["size-auto", { width: "auto", height: "auto" }],
    ["size-lg", { width: "var(--container-lg)", height: "var(--container-lg)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, sizeRules)).toEqual(css);
  });

  it("has no screen keyword (axes differ)", () => {
    expect(match("size-screen", sizeRules)).toBeUndefined();
  });
});
