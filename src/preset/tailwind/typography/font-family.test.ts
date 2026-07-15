import { describe, expect, it } from "vitest";
import { match } from "../../test-helpers.ts";
import { tailwindPreset } from "../index.ts";
import { createFontFamilyRules } from "./font-family.ts";

const fontFamilyRules = createFontFamilyRules();

describe("font-family", () => {
  it("maps the three stacks", () => {
    expect(match("font-sans", fontFamilyRules)).toEqual({
      "font-family":
        'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    });
    expect(match("font-serif", fontFamilyRules)).toEqual({
      "font-family": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    });
    expect(match("font-mono", fontFamilyRules)).toEqual({
      "font-family":
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    });
  });

  it.each(["font-sansx", "font-", "font", "xfont-sans"])("rejects %j", (token) => {
    expect(match(token, fontFamilyRules)).toBeUndefined();
  });

  it("supports custom stacks via createFontFamilyRules, keeping defaults for the rest", () => {
    const rules = createFontFamilyRules({ sans: '"Inter", sans-serif', mono: '"JetBrains Mono", monospace' });
    expect(match("font-sans", rules)).toEqual({ "font-family": '"Inter", sans-serif' });
    expect(match("font-mono", rules)).toEqual({ "font-family": '"JetBrains Mono", monospace' });
    // serif not overridden — default stack survives
    expect(match("font-serif", rules)).toEqual({
      "font-family": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    });
  });

  it("is tunable through tailwindPreset utility-path options", () => {
    const rules = tailwindPreset({
      include: ["typography/font-family"],
      options: { "typography/font-family": { sans: "system-ui" } },
    });
    expect(match("font-sans", rules)).toEqual({ "font-family": "system-ui" });
  });

  it("grows new classes from custom keys, keeping the defaults", () => {
    const rules = createFontFamilyRules({ "sans-noto": '"Noto Sans JP", sans-serif' });
    expect(match("font-sans-noto", rules)).toEqual({ "font-family": '"Noto Sans JP", sans-serif' });
    // the longer key must not shadow (or be shadowed by) the built-in "sans"
    expect(match("font-sans", rules)).toEqual({
      "font-family":
        'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    });
    expect(match("font-sans-notox", rules)).toBeUndefined();
  });

  it("accepts custom keys through tailwindPreset utility-path options", () => {
    const rules = tailwindPreset({
      include: ["typography/font-family"],
      options: { "typography/font-family": { "sans-noto": '"Noto Sans JP", sans-serif' } },
    });
    expect(match("font-sans-noto", rules)).toEqual({ "font-family": '"Noto Sans JP", sans-serif' });
    expect(match("font-serif", rules)).toEqual({
      "font-family": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    });
  });
});
