import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { tailwindPreset } from "../index.ts";
import type { SpacingOptions } from "./index.ts";

// the category-wide cap lives behind tailwindPreset's options
const createSpacingRules = (options?: SpacingOptions) =>
  tailwindPreset({ include: ["spacing"], options: { spacing: options } });

describe("spacing category options", () => {
  it("applies a shared cap to every utility via `max`", () => {
    const spacing = createSpacingRules({ max: 8 });
    expect(match("p-8", spacing)).toEqual({ padding: "2rem" });
    expect(match("p-9", spacing)).toBeUndefined();
    expect(match("m-9", spacing)).toBeUndefined();
  });

  it("excludeNegativeClasses broadcasts through the category options (padding unaffected)", () => {
    const rules = tailwindPreset({ include: ["spacing"], options: { spacing: { excludeNegativeClasses: true } } });
    expect(match("-m-2", rules)).toBeUndefined();
    expect(match("m-2", rules)).toEqual({ margin: "0.5rem" });
    expect(match("p-2", rules)).toEqual({ padding: "0.5rem" });
  });

  it("excludeNegativeClasses works via the utility-path key too", () => {
    const rules = tailwindPreset({
      include: ["spacing"],
      options: { "spacing/margin": { excludeNegativeClasses: true } },
    });
    expect(match("-m-2", rules)).toBeUndefined();
    expect(match("m-2", rules)).toEqual({ margin: "0.5rem" });
  });
});
