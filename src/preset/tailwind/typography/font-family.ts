import type { Rule } from "../../../types.ts";
import { withMeta } from "../../shared/with-meta.ts";

// font-family — https://tailwindcss.com/docs/font-family
const DEFAULT_STACKS = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Key → font stack. The three default keys override the built-in stacks;
 * any additional key grows a new class (`"sans-noto"` → `font-sans-noto`).
 * Pick keys that don't collide with other `font-*` utilities (font-weight
 * owns `font-bold`, `font-thin`, ...).
 */
export type FontFamilyOptions = {
  /** Font stack emitted by `font-sans` (default: the Tailwind sans stack). */
  sans?: string;
  /** Font stack emitted by `font-serif` (default: the Tailwind serif stack). */
  serif?: string;
  /** Font stack emitted by `font-mono` (default: the Tailwind mono stack). */
  mono?: string;
} & Record<string, string>;

export const createFontFamilyRules = (options: FontFamilyOptions = {}): Rule[] => {
  const stacks: Record<string, string> = { ...DEFAULT_STACKS, ...options };
  // longest alternative first so a custom key like "sans-noto" isn't shadowed by "sans"
  const alt = Object.keys(stacks)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  return withMeta([[new RegExp(`^font-(${alt})$`), ([, k]) => ({ "font-family": stacks[k ?? ""] ?? "" })]], {
    label: "font-family",
    category: "typography",
    tags: ["preset", "tailwind"],
  });
};
