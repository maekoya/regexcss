import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { tailwindPreset } from "../index.ts";

const colorRules = tailwindPreset({ include: ["color"] });

describe("preset color background-color", () => {
  it("is included in the color category selection", () => {
    expect(match("bg-blue", colorRules)).toEqual({ backgroundColor: "blue" });
    expect(match("bg-", colorRules)).toBeUndefined();
  });
});
