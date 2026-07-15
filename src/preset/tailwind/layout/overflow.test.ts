import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { overflowRules } from "./overflow.ts";

describe("overflow", () => {
  it.each([
    ["overflow-auto", { overflow: "auto" }],
    ["overflow-hidden", { overflow: "hidden" }],
    ["overflow-clip", { overflow: "clip" }],
    ["overflow-visible", { overflow: "visible" }],
    ["overflow-scroll", { overflow: "scroll" }],
    ["overflow-x-auto", { "overflow-x": "auto" }],
    ["overflow-x-hidden", { "overflow-x": "hidden" }],
    ["overflow-y-scroll", { "overflow-y": "scroll" }],
    ["overflow-y-clip", { "overflow-y": "clip" }],
  ])("maps %j", (token, css) => {
    expect(match(token, overflowRules)).toEqual(css);
  });

  it.each(["overflow", "overflow-", "overflow--auto", "overflow-z-auto", "overflow-x", "overflow-x-", "overflow-none"])(
    "rejects %j",
    (token) => {
      expect(match(token, overflowRules)).toBeUndefined();
    },
  );
});
