import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createFlexRules } from "./flex.ts";

const flexRules = createFlexRules();

describe("flex", () => {
  it.each([
    ["flex-auto", "auto"],
    ["flex-initial", "0 auto"],
    ["flex-none", "none"],
  ])("%s -> flex: %s", (token, value) => {
    expect(match(token, flexRules)).toEqual({ flex: value });
  });

  it.each([
    ["flex-1", "1"],
    ["flex-0", "0"],
    ["flex-12", "12"],
  ])("%s -> flex: %s", (token, value) => {
    expect(match(token, flexRules)).toEqual({ flex: value });
  });

  it.each([
    ["flex-1/2", "calc(1/2 * 100%)"],
    ["flex-2/3", "calc(2/3 * 100%)"],
    ["flex-11/12", "calc(11/12 * 100%)"],
  ])("%s -> flex: %s", (token, value) => {
    expect(match(token, flexRules)).toEqual({ flex: value });
  });

  it.each(["flex", "flex-", "flex-row", "flex-wrap", "flex-1.5", "-flex-1", "flex-0/2", "flex-2/2", "flex-1/13"])(
    "rejects %j",
    (token) => {
      expect(match(token, flexRules)).toBeUndefined();
    },
  );

  it("rejects values above the default cap and supports a custom cap via the factory", () => {
    expect(match("flex-13", flexRules)).toBeUndefined();
    const flex = createFlexRules({ max: 20 });
    expect(match("flex-20", flex)).toEqual({ flex: "20" });
    expect(match("flex-21", flex)).toBeUndefined();
  });
});
