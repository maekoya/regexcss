import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// font-family — https://tailwindcss.com/docs/font-family
const DEFAULT_STACKS = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export interface FontFamilyOptions {
  /** Font stack emitted by `font-sans` (default: the Tailwind sans stack). */
  sans?: string;
  /** Font stack emitted by `font-serif` (default: the Tailwind serif stack). */
  serif?: string;
  /** Font stack emitted by `font-mono` (default: the Tailwind mono stack). */
  mono?: string;
}

export const createFontFamilyRules = (options: FontFamilyOptions = {}): Rule[] => {
  const stacks: Record<string, string> = { ...DEFAULT_STACKS, ...options };

  return withMeta([[/^font-(sans|serif|mono)$/, ([, k]) => ({ "font-family": stacks[k ?? ""] ?? "" })]], {
    label: "font-family",
    category: "typography",
    tags: ["preset", "tailwind"],
  });
};
