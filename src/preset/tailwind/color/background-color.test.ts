import { describe, expect, it } from "vitest";
import { match as matchIn } from "../../test-helpers.ts";
import { backgroundColorRules } from "./background-color.ts";

const match = (token: string, rules = backgroundColorRules) => matchIn(token, rules);

describe("preset color background-color", () => {
  it.each([
    ["bg-red", { backgroundColor: "red" }],
    ["bg-tomato", { backgroundColor: "tomato" }],
    ["bg-transparent", { backgroundColor: "transparent" }],
    ["bg-currentColor", { backgroundColor: "currentColor" }],
    ["bg-inherit", { backgroundColor: "inherit" }],
    // \w also covers digits and underscores — the value is passed through verbatim
    ["bg-123", { backgroundColor: "123" }],
    ["bg-red_500", { backgroundColor: "red_500" }],
  ])("maps %j to the verbatim color value", (token, expected) => {
    expect(match(token)).toEqual(expected);
  });

  it.each([
    "bg-", // empty value
    "bg", // no value segment at all
    "bg-red-500", // hyphen is not \w — Tailwind-style shades do not match
    "bg-#fff", // hex colors do not match
    "bg-red.500", // dot is not \w
    "Bg-red", // prefix is case-sensitive
    "xbg-red", // anchored at start
    "bg-red ", // anchored at end
    "background-red", // wrong prefix
    "text-red", // different utility
  ])("does not match %j", (token) => {
    expect(match(token)).toBeUndefined();
  });
});
