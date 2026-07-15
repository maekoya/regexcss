import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { overscrollRules } from "./overscroll.ts";

describe("overscroll", () => {
  it.each([
    ["overscroll-auto", { "overscroll-behavior": "auto" }],
    ["overscroll-contain", { "overscroll-behavior": "contain" }],
    ["overscroll-none", { "overscroll-behavior": "none" }],
    ["overscroll-x-auto", { "overscroll-behavior-x": "auto" }],
    ["overscroll-x-contain", { "overscroll-behavior-x": "contain" }],
    ["overscroll-y-none", { "overscroll-behavior-y": "none" }],
  ])("maps %j", (token, css) => {
    expect(match(token, overscrollRules)).toEqual(css);
  });

  it.each([
    "overscroll",
    "overscroll-",
    "overscroll--auto",
    "overscroll-x-scroll",
    "overscroll-z-none",
    "overscroll-hidden",
  ])("rejects %j", (token) => {
    expect(match(token, overscrollRules)).toBeUndefined();
  });
});
