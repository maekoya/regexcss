// The Tailwind-flavored preset. All consumption goes through the preset
// function: `tailwindPreset({ include: ["spacing", "typography/line-clamp"] })`.
// The category/page tables are exposed as `tailwindPreset.categories`.
export { tailwindPreset } from "./preset.ts";
export type { TailwindPresetName, TailwindPresetOptions, TailwindPresetSelection } from "./preset.ts";
