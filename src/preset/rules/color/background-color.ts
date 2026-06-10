import type { Rule } from "../../../types.ts";

// background-color — https://tailwindcss.com/docs/background-color
// Matches single-word values only (`bg-red`, `bg-transparent`): `\w` excludes `-` and
// `#`, so Tailwind-style palette tokens (`bg-rose-500`) and hex values don't match.
// The captured word is emitted verbatim — invalid CSS color names pass through as-is.
export const backgroundColorRules: Rule[] = [[/^bg-(\w+)$/, ([, color]) => ({ backgroundColor: color ?? "" })]];
