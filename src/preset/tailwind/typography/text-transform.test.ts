import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { textTransformRules } from "./text-transform.ts";

describe("text-transform", () => {
  it.each([
    ["uppercase", "uppercase"],
    ["lowercase", "lowercase"],
    ["capitalize", "capitalize"],
    ["normal-case", "none"],
  ])("%j -> text-transform: %j", (token, value) => {
    expect(match(token, textTransformRules)).toEqual({ "text-transform": value });
  });

  it.each(["uppercased", "case-normal", "text-uppercase"])("rejects %j", (token) => {
    expect(match(token, textTransformRules)).toBeUndefined();
  });
});
