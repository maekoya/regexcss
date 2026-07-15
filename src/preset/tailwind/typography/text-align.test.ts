import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { textAlignRules } from "./text-align.ts";

describe("text-align", () => {
  it.each([
    ["text-left", "left"],
    ["text-center", "center"],
    ["text-right", "right"],
    ["text-justify", "justify"],
  ])("%j -> text-align: %j", (token, align) => {
    expect(match(token, textAlignRules)).toEqual({ "text-align": align });
  });

  it.each(["text-start", "text-end", "text-centered", "text-"])("rejects %j", (token) => {
    expect(match(token, textAlignRules)).toBeUndefined();
  });
});
