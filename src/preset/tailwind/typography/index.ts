import type { PageTable } from "../../shared/page-table.ts";
import { fontFamilyRules } from "./font-family.ts";
import { fontStyleRules } from "./font-style.ts";
import { fontVariantNumericRules } from "./font-variant-numeric.ts";
import { fontWeightRules } from "./font-weight.ts";
import { createLineClampRules } from "./line-clamp.ts";
import { textAlignRules } from "./text-align.ts";
import { textDecorationLineRules } from "./text-decoration-line.ts";
import { textOverflowRules } from "./text-overflow.ts";
import { textTransformRules } from "./text-transform.ts";
import { textWrapRules } from "./text-wrap.ts";
import { verticalAlignRules } from "./vertical-align.ts";
import { whiteSpaceRules } from "./white-space.ts";
import { wordBreakRules } from "./word-break.ts";

// ONE canonical page table. Key order = cascade order; keys are the page file
// basenames and become the `typography/<slug>` names accepted by tailwindPreset.
// Factory pages (line-clamp) are tuned via page-path options, e.g.
// `options: { "typography/line-clamp": { max: 3 } }`.
export const typographyPages = {
  "font-family": fontFamilyRules,
  "font-style": fontStyleRules,
  "font-variant-numeric": fontVariantNumericRules,
  "font-weight": fontWeightRules,
  "line-clamp": createLineClampRules,
  "text-align": textAlignRules,
  "text-decoration-line": textDecorationLineRules,
  "text-overflow": textOverflowRules,
  "text-transform": textTransformRules,
  "text-wrap": textWrapRules,
  "vertical-align": verticalAlignRules,
  "white-space": whiteSpaceRules,
  "word-break": wordBreakRules,
} satisfies PageTable;
