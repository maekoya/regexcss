import type { Rule } from "../../../types.ts";
import { fontFamilyRules } from "./font-family.ts";
import { fontStyleRules } from "./font-style.ts";
import { fontVariantNumericRules } from "./font-variant-numeric.ts";
import { fontWeightRules } from "./font-weight.ts";
import { createLineClampRules, type LineClampOptions, lineClampRules } from "./line-clamp.ts";
import { textAlignRules } from "./text-align.ts";
import { textDecorationLineRules } from "./text-decoration-line.ts";
import { textOverflowRules } from "./text-overflow.ts";
import { textTransformRules } from "./text-transform.ts";
import { textWrapRules } from "./text-wrap.ts";
import { verticalAlignRules } from "./vertical-align.ts";
import { whiteSpaceRules } from "./white-space.ts";
import { wordBreakRules } from "./word-break.ts";

// re-export individual presets for granular use. Each already carries its docs
// metadata (label / category / `preset` tag), so it stays fully described when
// imported and used on its own.
export {
  createLineClampRules,
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
export type { LineClampOptions };

export interface TypographyOptions {
  lineClamp?: LineClampOptions;
}

// aggregate factory — every preset in this category with per-page numeric caps.
export const createTypographyRules = (options: TypographyOptions = {}): Rule[] => [
  ...fontFamilyRules,
  ...fontStyleRules,
  ...fontVariantNumericRules,
  ...fontWeightRules,
  ...createLineClampRules(options.lineClamp),
  ...textAlignRules,
  ...textDecorationLineRules,
  ...textOverflowRules,
  ...textTransformRules,
  ...textWrapRules,
  ...verticalAlignRules,
  ...whiteSpaceRules,
  ...wordBreakRules,
];

// aggregate — every preset in this category combined, with default caps.
export const typographyRules: Rule[] = createTypographyRules();
