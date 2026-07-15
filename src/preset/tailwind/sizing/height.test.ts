import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createHeightRules } from "./height.ts";

const heightRules = createHeightRules();

describe("preset sizing — height", () => {
  it.each([
    ["h-4", { height: "1rem" }],
    ["h-screen", { height: "100vh" }],
    ["h-dvh", { height: "100dvh" }],
    ["h-lh", { height: "1lh" }],
    ["h-full", { height: "100%" }],
    ["h-3/4", { height: "calc(3/4 * 100%)" }],
  ])("%s → %o", (token, css) => {
    expect(match(token, heightRules)).toEqual(css);
  });
});
