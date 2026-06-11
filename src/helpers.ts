// Optional helpers. Import from 'regexcss/helpers'.

import { readFileSync } from "node:fs";
import type { Variant } from "./types.ts";

// --- unit helpers ---

export const rem = (n: string | number, factor = 4): string => `${Number(n) / factor}rem`;

export const px = (n: string | number): string => `${Number(n)}px`;

export const em = (n: string | number): string => `${Number(n)}em`;

export const pct = (n: string | number): string => `${Number(n)}%`;

export const vw = (n: string | number): string => `${Number(n)}vw`;

export const vh = (n: string | number): string => `${Number(n)}vh`;

// --- variant helper ---

// Escape regex meta characters so a user-supplied prefix is treated literally.
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build a {@link Variant} from a prefix plus optional selector / parent transforms.
 *
 * - `selector`: string suffix (e.g. `":hover"`) — appended to the generated class selector.
 *   Or a function `(s) => string` for complex shapes (e.g. `(s) => `.group:hover ${s}``).
 * - `parent`: at-rule that wraps the rule (e.g. `"@media (min-width: 768px)"`,
 *   `"@media (any-hover: hover)"`, `"@container (width > 30em)"`).
 * - `group`: exclusivity group — at most one variant per group applies to a token, so
 *   contradictory stacks like `md:sm:` are dropped (with a warning) instead of emitting
 *   nested media queries.
 *
 * The prefix is treated literally — regex meta characters in it are escaped.
 *
 * @example
 * createVariant("md", { parent: "@media (min-width: 768px)", group: "window-size" })
 * createVariant("hover", { selector: ":hover" })
 * createVariant("hover", { selector: ":hover", parent: "@media (any-hover: hover)" })
 * createVariant("group-hover", { selector: (s) => `.group:hover ${s}` })
 */
export const createVariant = (
  prefix: string,
  options: {
    selector?: string | ((s: string) => string);
    parent?: string;
    group?: string;
  },
): Variant => {
  const { selector, parent, group } = options;
  const selectorFn = typeof selector === "string" ? (s: string) => `${s}${selector}` : selector;
  return [
    new RegExp(`^${escapeRegExp(prefix)}:`),
    (_, raw) => ({
      matcher: raw.slice(prefix.length + 1),
      ...(selectorFn ? { selector: selectorFn } : {}),
      ...(parent ? { parent } : {}),
      ...(group !== undefined ? { group } : {}),
    }),
  ];
};

// --- @custom-media parsers ---

// Extracts `@custom-media --name (query);` declarations from a CSS source.
// CSS block comments (`/* ... */`) are stripped before parsing to avoid
// false positives inside commented-out lines. Returns a `{ "--name": "(query)" }`
// map ready to pass to `defineConfig({ customMedia: ... })`.
// `(?:\*\/|$)` makes an open `/*` always resolve (to its close or end-of-input),
// so the global replace never re-scans from each `/*` — avoiding O(n²) backtracking
// on inputs like `/*a/*a/*…` (CodeQL js/polynomial-redos). Treating an unterminated
// comment as running to EOF also matches CSS tokenization.
const BLOCK_COMMENT_RE = /\/\*[\s\S]*?(?:\*\/|$)/g;
// The query starts with a non-space char (`[^;\s]`) so the preceding `\s+` and the
// query no longer both match whitespace — removing the ambiguity that made this
// polynomial on `@custom-media --x␠␠…` (no trailing `;`).
const CUSTOM_MEDIA_RE = /@custom-media\s+(--[\w-]+)\s+([^;\s][^;]*);/g;

export const parseCustomMedia = (cssText: string): Record<string, string> => {
  const stripped = cssText.replace(BLOCK_COMMENT_RE, "");
  const result: Record<string, string> = {};
  for (const m of stripped.matchAll(CUSTOM_MEDIA_RE)) {
    const [, name, query] = m;
    if (name && query) result[name] = query.trim();
  }
  return result;
};

// Convenience: read a CSS file from disk and parse its `@custom-media` decls.
// Node-only. Pass an absolute path (resolve relative paths with `node:path`).
export const loadCustomMedia = (path: string): Record<string, string> => parseCustomMedia(readFileSync(path, "utf-8"));
