import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { alignSelfRules } from "./align-self.ts";

describe("align-self", () => {
  it.each([
    ["self-auto", "auto"],
    ["self-start", "flex-start"],
    ["self-end", "flex-end"],
    ["self-center", "center"],
    ["self-stretch", "stretch"],
    ["self-baseline", "baseline"],
  ])("%s -> align-self: %s", (token, value) => {
    expect(match(token, alignSelfRules)).toEqual({ "align-self": value });
  });

  it.each(["self-between", "self-normal", "self-"])("rejects %j", (token) => {
    expect(match(token, alignSelfRules)).toBeUndefined();
  });
});
