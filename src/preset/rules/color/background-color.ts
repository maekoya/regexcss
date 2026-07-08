import type { Rule } from "../../../types.ts";
import { withMeta } from "../with-meta.ts";

// background-color — https://tailwindcss.com/docs/background-color
// Matches single-word values only (`bg-red`, `bg-transparent`): `\w` excludes `-` and
// `#`, so Tailwind-style palette tokens (`bg-rose-500`) and hex values don't match.
// The captured word is emitted verbatim — invalid CSS color names pass through as-is.
// `\w+` is open-ended, so docs enumeration relies on the representative samples below.
export const backgroundColorRules: Rule[] = withMeta(
  [
    [
      /^bg-(\w+)$/,
      ([, color]) => ({ backgroundColor: color ?? "" }),
      { samples: [{ class: "bg-<color>", style: "background-color: <color>;" }] },
    ],
  ],
  { label: "background-color", category: "color", tags: ["preset"] },
);
