import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { objectFitRules } from "./object-fit.ts";

describe("object-fit", () => {
  it.each([
    ["object-contain", "contain"],
    ["object-cover", "cover"],
    ["object-fill", "fill"],
    ["object-none", "none"],
    ["object-scale-down", "scale-down"],
  ])("maps %j to object-fit: %j", (token, value) => {
    expect(match(token, objectFitRules)).toEqual({ "object-fit": value });
  });

  it.each(["object-center", "object-stretch", "object-scale", "object-", "object-cover-x"])("rejects %j", (token) => {
    expect(match(token, objectFitRules)).toBeUndefined();
  });
});
