import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// font-family — https://tailwindcss.com/docs/font-family
const FONT_FAMILY: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const fontFamilyRules: Rule[] = withMeta(
  [[/^font-(sans|serif|mono)$/, ([, k]) => ({ "font-family": FONT_FAMILY[k ?? ""] ?? "" })]],
  { label: "font-family", category: "typography", tags: ["preset"] },
);
