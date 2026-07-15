import { describe, expect, it } from "vitest";
import { fontFamilyRules } from "../src/preset/tailwind/typography/font-family.ts";
import { fontStyleRules } from "../src/preset/tailwind/typography/font-style.ts";
import { fontVariantNumericRules } from "../src/preset/tailwind/typography/font-variant-numeric.ts";
import { fontWeightRules } from "../src/preset/tailwind/typography/font-weight.ts";
import { createLineClampRules } from "../src/preset/tailwind/typography/line-clamp.ts";
import { textAlignRules } from "../src/preset/tailwind/typography/text-align.ts";
import { textDecorationLineRules } from "../src/preset/tailwind/typography/text-decoration-line.ts";
import { textOverflowRules } from "../src/preset/tailwind/typography/text-overflow.ts";
import { textTransformRules } from "../src/preset/tailwind/typography/text-transform.ts";
import { textWrapRules } from "../src/preset/tailwind/typography/text-wrap.ts";
import { verticalAlignRules } from "../src/preset/tailwind/typography/vertical-align.ts";
import { whiteSpaceRules } from "../src/preset/tailwind/typography/white-space.ts";
import { wordBreakRules } from "../src/preset/tailwind/typography/word-break.ts";
import { match } from "./preset-helpers.ts";

const lineClampRules = createLineClampRules();

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
});

describe("font-style", () => {
  it("maps italic and not-italic", () => {
    expect(match("italic", fontStyleRules)).toEqual({ "font-style": "italic" });
    expect(match("not-italic", fontStyleRules)).toEqual({ "font-style": "normal" });
  });

  it.each(["italics", "not-italics", "font-italic"])("rejects %j", (token) => {
    expect(match(token, fontStyleRules)).toBeUndefined();
  });
});

describe("font-variant-numeric", () => {
  it.each([
    ["normal-nums", "normal"],
    ["ordinal", "ordinal"],
    ["slashed-zero", "slashed-zero"],
    ["lining-nums", "lining-nums"],
    ["oldstyle-nums", "oldstyle-nums"],
    ["proportional-nums", "proportional-nums"],
    ["tabular-nums", "tabular-nums"],
    ["diagonal-fractions", "diagonal-fractions"],
    ["stacked-fractions", "stacked-fractions"],
  ])("%j -> font-variant-numeric: %j", (token, value) => {
    expect(match(token, fontVariantNumericRules)).toEqual({ "font-variant-numeric": value });
  });

  it.each(["nums", "fractions", "tabular", "tabular-nums2"])("rejects %j", (token) => {
    expect(match(token, fontVariantNumericRules)).toBeUndefined();
  });
});

describe("font-weight", () => {
  it.each([
    ["font-thin", "100"],
    ["font-extralight", "200"],
    ["font-light", "300"],
    ["font-normal", "400"],
    ["font-medium", "500"],
    ["font-semibold", "600"],
    ["font-bold", "700"],
    ["font-extrabold", "800"],
    ["font-black", "900"],
  ])("%j -> font-weight: %j", (token, weight) => {
    expect(match(token, fontWeightRules)).toEqual({ "font-weight": weight });
  });

  it.each(["font-700", "font-bolder", "bold", "font-boldx"])("rejects %j", (token) => {
    expect(match(token, fontWeightRules)).toBeUndefined();
  });
});

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

describe("text-overflow", () => {
  it("truncate emits the three-property block", () => {
    expect(match("truncate", textOverflowRules)).toEqual({
      overflow: "hidden",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    });
  });

  it("text-ellipsis / text-clip emit text-overflow only", () => {
    expect(match("text-ellipsis", textOverflowRules)).toEqual({ "text-overflow": "ellipsis" });
    expect(match("text-clip", textOverflowRules)).toEqual({ "text-overflow": "clip" });
  });

  it.each(["truncated", "text-truncate", "ellipsis"])("rejects %j", (token) => {
    expect(match(token, textOverflowRules)).toBeUndefined();
  });
});

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

describe("text-wrap", () => {
  it.each([
    ["text-wrap", "wrap"],
    ["text-nowrap", "nowrap"],
    ["text-balance", "balance"],
    ["text-pretty", "pretty"],
  ])("%j -> text-wrap: %j", (token, value) => {
    expect(match(token, textWrapRules)).toEqual({ "text-wrap": value });
  });

  it.each(["text-wraps", "wrap", "text-no-wrap"])("rejects %j", (token) => {
    expect(match(token, textWrapRules)).toBeUndefined();
  });
});

describe("vertical-align", () => {
  it.each([
    ["align-baseline", "baseline"],
    ["align-top", "top"],
    ["align-middle", "middle"],
    ["align-bottom", "bottom"],
    ["align-text-top", "text-top"],
    ["align-text-bottom", "text-bottom"],
    ["align-sub", "sub"],
    ["align-super", "super"],
  ])("%j -> vertical-align: %j", (token, value) => {
    expect(match(token, verticalAlignRules)).toEqual({ "vertical-align": value });
  });

  it.each(["align-text", "align-center", "align-"])("rejects %j", (token) => {
    expect(match(token, verticalAlignRules)).toBeUndefined();
  });
});

describe("white-space", () => {
  it.each([
    ["whitespace-normal", "normal"],
    ["whitespace-nowrap", "nowrap"],
    ["whitespace-pre", "pre"],
    ["whitespace-pre-line", "pre-line"],
    ["whitespace-pre-wrap", "pre-wrap"],
    ["whitespace-break-spaces", "break-spaces"],
  ])("%j -> white-space: %j", (token, value) => {
    expect(match(token, whiteSpaceRules)).toEqual({ "white-space": value });
  });

  it.each(["whitespace-pre-", "whitespace-prewrap", "whitespace-wrap"])("rejects %j", (token) => {
    expect(match(token, whiteSpaceRules)).toBeUndefined();
  });
});

describe("word-break", () => {
  it.each([
    ["break-normal", "normal"],
    ["break-all", "break-all"],
    ["break-keep", "keep-all"],
  ])("%j -> word-break: %j", (token, value) => {
    expect(match(token, wordBreakRules)).toEqual({ "word-break": value });
  });

  it.each(["break-words", "break-word", "break-keep-all"])("rejects %j", (token) => {
    expect(match(token, wordBreakRules)).toBeUndefined();
  });
});
