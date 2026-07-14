import {
  definePreset,
  type PresetNameOf,
  type PresetOptionsMapOf,
  type PresetSelectionOf,
} from "../shared/define-preset.ts";
import { colorPageOptions, colorPages } from "./color/index.ts";
import { flexboxGridPageOptions, flexboxGridPages } from "./flexbox-grid/index.ts";
import { layoutPageOptions, layoutPages } from "./layout/index.ts";
import { sizingPageOptions, sizingPages } from "./sizing/index.ts";
import { spacingPageOptions, spacingPages } from "./spacing/index.ts";
import { typographyPageOptions, typographyPages } from "./typography/index.ts";

/**
 * Build a rule set from preset names.
 *
 * `tailwindPreset({ include: ["spacing", "typography/line-clamp"] })` — the
 * given categories/pages, in the given order — plus optional `exclude` and
 * per-category / per-page `options`. The category map is exposed as
 * `tailwindPreset.categories`; its key order is the canonical rule order.
 */
export const tailwindPreset = definePreset(
  {
    color: { pages: colorPages, pageOptions: colorPageOptions },
    "flexbox-grid": { pages: flexboxGridPages, pageOptions: flexboxGridPageOptions },
    layout: { pages: layoutPages, pageOptions: layoutPageOptions },
    sizing: { pages: sizingPages, pageOptions: sizingPageOptions },
    spacing: { pages: spacingPages, pageOptions: spacingPageOptions },
    typography: { pages: typographyPages, pageOptions: typographyPageOptions },
  },
  "tailwind",
);

/** Category names plus `category/page` paths, e.g. `"spacing" | "typography/line-clamp"`. */
export type TailwindPresetName = PresetNameOf<typeof tailwindPreset>;
/** Object-form selection: `{ include?, exclude?, options? }`. */
export type TailwindPresetSelection = PresetSelectionOf<typeof tailwindPreset>;
/** Per-category / per-page options map, e.g. `{ sizing: { max: 64 }, "sizing/width": { max: 32 } }`. */
export type TailwindPresetOptions = PresetOptionsMapOf<typeof tailwindPreset>;
