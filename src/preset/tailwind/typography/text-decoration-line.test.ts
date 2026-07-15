import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { textDecorationLineRules } from "./text-decoration-line.ts";

describe("text-decoration-line", () => {
  it.each([
    ["underline", "underline"],
    ["overline", "overline"],
    ["line-through", "line-through"],
    ["no-underline", "none"],
  ])("%j -> text-decoration-line: %j", (token, value) => {
    expect(match(token, textDecorationLineRules)).toEqual({ "text-decoration-line": value });
  });

  it.each(["underlined", "no-overline", "strike"])("rejects %j", (token) => {
    expect(match(token, textDecorationLineRules)).toBeUndefined();
  });
});
