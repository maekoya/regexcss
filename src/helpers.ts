// Optional helpers. Import from 'regexcss/helpers'.

import { readFileSync } from "node:fs";
import { buildVariant } from "./core/variants.ts";
import type { Variant, VariantObject } from "./types.ts";

// --- unit helpers ---

export const rem = (n: string | number, factor = 4): string => `${Number(n) / factor}rem`;

export const px = (n: string | number): string => `${Number(n)}px`;

export const em = (n: string | number): string => `${Number(n)}em`;

export const pct = (n: string | number): string => `${Number(n)}%`;

export const vw = (n: string | number): string => `${Number(n)}vw`;

export const vh = (n: string | number): string => `${Number(n)}vh`;

// --- variant helper ---

/**
 * Build a {@link Variant} from a prefix plus optional selector / parent transforms.
 *
 * Kept for programmatic use — in a config's `variants`, the plain object form
 * (`{ prefix: "md", parent: "@media (--md)" }`, see `VariantObject`) does the same
 * thing with no import.
 *
 * @example
 * createVariant("md", { parent: "@media (min-width: 768px)", group: "window-size" })
 * createVariant("hover", { selector: ":hover" })
 * createVariant("hover", { selector: ":hover", parent: "@media (any-hover: hover)" })
 * createVariant("group-hover", { selector: (s) => `.group:hover ${s}` })
 */
export const createVariant = (prefix: string, options: Omit<VariantObject, "prefix">): Variant =>
  buildVariant({ prefix, ...options });

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
