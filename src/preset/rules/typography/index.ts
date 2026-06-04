import type { Rule } from "../../../types.ts";
import { fontFamilyRules } from "./font-family.ts";
import { fontStyleRules } from "./font-style.ts";
import { fontVariantNumericRules } from "./font-variant-numeric.ts";
import { fontWeightRules } from "./font-weight.ts";
import { lineClampRules } from "./line-clamp.ts";
import { textAlignRules } from "./text-align.ts";
import { textDecorationLineRules } from "./text-decoration-line.ts";
import { textOverflowRules } from "./text-overflow.ts";
import { textTransformRules } from "./text-transform.ts";
import { textWrapRules } from "./text-wrap.ts";
import { verticalAlignRules } from "./vertical-align.ts";
import { whiteSpaceRules } from "./white-space.ts";
import { wordBreakRules } from "./word-break.ts";

// re-export individual presets for granular use
export {
  fontFamilyRules,
  fontStyleRules,
  fontVariantNumericRules,
  fontWeightRules,
  lineClampRules,
  textAlignRules,
  textDecorationLineRules,
  textOverflowRules,
  textTransformRules,
  textWrapRules,
  verticalAlignRules,
  whiteSpaceRules,
  wordBreakRules,
};

// aggregate — every preset in this category combined.
export const typographyRules: Rule[] = [
  ...fontFamilyRules,
  ...fontStyleRules,
  ...fontVariantNumericRules,
  ...fontWeightRules,
  ...lineClampRules,
  ...textAlignRules,
  ...textDecorationLineRules,
  ...textOverflowRules,
  ...textTransformRules,
  ...textWrapRules,
  ...verticalAlignRules,
  ...whiteSpaceRules,
  ...wordBreakRules,
];
