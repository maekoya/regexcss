import {
  definePreset,
  type PresetNameOf,
  type PresetOptionsMapOf,
  type PresetSelectionOf,
} from "../shared/define-preset.ts";
import { colorPages } from "./color/index.ts";
import { flexboxGridPages } from "./flexbox-grid/index.ts";
import { layoutPages } from "./layout/index.ts";
import { sizingPageOptions, sizingPages } from "./sizing/index.ts";
import { spacingPageOptions, spacingPages } from "./spacing/index.ts";
import { typographyPages } from "./typography/index.ts";

/**
 * Build a rule set from preset names.
 *
 * `tailwindPreset({ include: ["spacing", "typography/line-clamp"] })` — the
 * given categories/pages, in the given order — plus optional `exclude` and
 * `options`. Category-level options exist only for the shared-`max`
 * categories (`sizing`, `spacing`); every other factory page is tuned via its
 * page path, e.g. `options: { "layout/z-index": { max: 100 } }`. The category
 * map is exposed as `tailwindPreset.categories`; its key order is the
 * canonical rule order.
 */
export const tailwindPreset = definePreset(
  {
    color: { pages: colorPages },
    "flexbox-grid": { pages: flexboxGridPages },
    layout: { pages: layoutPages },
    sizing: { pages: sizingPages, pageOptions: sizingPageOptions },
    spacing: { pages: spacingPages, pageOptions: spacingPageOptions },
    typography: { pages: typographyPages },
  },
  "tailwind",
);

/** Category names plus `category/page` paths, e.g. `"spacing" | "typography/line-clamp"`. */
export type TailwindPresetName = PresetNameOf<typeof tailwindPreset>;
/** Object-form selection: `{ include?, exclude?, options? }`. */
export type TailwindPresetSelection = PresetSelectionOf<typeof tailwindPreset>;
/** Per-category / per-page options map, e.g. `{ sizing: { max: 64 }, "sizing/width": { max: 32 } }`. */
export type TailwindPresetOptions = PresetOptionsMapOf<typeof tailwindPreset>;
