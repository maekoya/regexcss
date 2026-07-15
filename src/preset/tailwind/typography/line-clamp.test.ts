import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { createLineClampRules } from "./line-clamp.ts";

const lineClampRules = createLineClampRules();

describe("line-clamp", () => {
  it("emits the full multi-property block for numbers", () => {
    expect(match("line-clamp-3", lineClampRules)).toEqual({
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": "3",
    });
    expect(match("line-clamp-6", lineClampRules)).toEqual({
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": "6",
    });
  });

  it("caps the line count at the default of 6", () => {
    expect(match("line-clamp-7", lineClampRules)).toBeUndefined();
  });

  it("supports a custom cap via createLineClampRules", () => {
    const rules = createLineClampRules({ max: 10 });
    expect(match("line-clamp-10", rules)).toMatchObject({ "-webkit-line-clamp": "10" });
    expect(match("line-clamp-11", rules)).toBeUndefined();
  });

  it("emits the reset block for line-clamp-none", () => {
    expect(match("line-clamp-none", lineClampRules)).toEqual({
      overflow: "visible",
      display: "block",
      "-webkit-box-orient": "horizontal",
      "-webkit-line-clamp": "none",
    });
  });

  it.each(["line-clamp-", "line-clamp-1.5", "line-clamp--1", "line-clamp-x"])("rejects %j", (token) => {
    expect(match(token, lineClampRules)).toBeUndefined();
  });
});
