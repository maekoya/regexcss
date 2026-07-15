import {
  definePreset,
  type PresetNameOf,
  type PresetOptionsMapOf,
  type PresetSelectionOf,
} from "../shared/define-preset.ts";
import { colorUtilities } from "./color/index.ts";
import { flexboxGridUtilities } from "./flexbox-grid/index.ts";
import { layoutUtilities } from "./layout/index.ts";
import { sizingUtilityOptions, sizingUtilities } from "./sizing/index.ts";
import { spacingUtilityOptions, spacingUtilities } from "./spacing/index.ts";
import { typographyUtilities } from "./typography/index.ts";

/**
 * Build a rule set from preset names.
 *
 * `tailwindPreset({ include: ["spacing", "typography/line-clamp"] })` — the
 * given categories/utilities, in the given order — plus optional `exclude` and
 * `options`. Category-level options exist only for the shared-`max`
 * categories (`sizing`, `spacing`); every other factory utility is tuned via its
 * utility path, e.g. `options: { "layout/z-index": { max: 100 } }`. The category
 * map is exposed as `tailwindPreset.categories`; its key order is the
 * canonical rule order.
 */
export const tailwindPreset = definePreset(
  {
    color: { utilities: colorUtilities },
    "flexbox-grid": { utilities: flexboxGridUtilities },
    layout: { utilities: layoutUtilities },
    sizing: { utilities: sizingUtilities, utilityOptions: sizingUtilityOptions },
    spacing: { utilities: spacingUtilities, utilityOptions: spacingUtilityOptions },
    typography: { utilities: typographyUtilities },
  },
  "tailwind",
);

/** Category names plus `category/utility` paths, e.g. `"spacing" | "typography/line-clamp"`. */
export type TailwindPresetName = PresetNameOf<typeof tailwindPreset>;
/** Object-form selection: `{ include?, exclude?, options? }`. */
export type TailwindPresetSelection = PresetSelectionOf<typeof tailwindPreset>;
/** Per-category / per-utility options map, e.g. `{ sizing: { max: 64 }, "sizing/width": { max: 32 } }`. */
export type TailwindPresetOptions = PresetOptionsMapOf<typeof tailwindPreset>;
