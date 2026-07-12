import type { ExplainResult } from "regexcss";

// Pure formatting (no vscode dependency) so it can be unit-tested directly.

// Browser/Tailwind default root font size. Used to annotate rem values with their
// px equivalent in hover previews (`padding: 2rem; /* 32px */`).
const REM_IN_PX = 16;

const REM_VALUE = /(-?\d*\.?\d+)rem/g;

/**
 * If a declaration's value contains any `rem` lengths, return the value with every
 * `rem` converted to `px` (e.g. `0.5rem 1rem` → `8px 16px`, `calc(1rem + 2px)` →
 * `calc(16px + 2px)`). Returns undefined when there is no rem to convert.
 */
const remToPxComment = (declaration: string): string | undefined => {
  const colon = declaration.indexOf(":");
  if (colon === -1) return undefined;
  const value = declaration.slice(colon + 1);
  if (!value.match(REM_VALUE)) return undefined;
  return value.replace(REM_VALUE, (_, n: string) => `${+(Number(n) * REM_IN_PX).toFixed(4)}px`).trim();
};

const indent = (block: string): string =>
  block
    .split("\n")
    .map((l) => (l.length > 0 ? `  ${l}` : l))
    .join("\n");

/**
 * Render an {@link ExplainResult} as a readable CSS rule, e.g.
 * `@media (--md) {\n  .md\:m-4 {\n    margin: 1rem;\n  }\n}`. Declarations are split
 * onto their own indented lines; variant `parents` wrap the rule (outermost first).
 */
export const formatExplainCss = (res: ExplainResult): string => {
  const decls = res.declarations
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const px = remToPxComment(d);
      return px ? `  ${d}; /* ${px} */` : `  ${d};`;
    })
    .join("\n");
  let block = `${res.selector} {\n${decls}\n}`;
  for (let i = res.parents.length - 1; i >= 0; i--) {
    block = `${res.parents[i]} {\n${indent(block)}\n}`;
  }
  return block;
};
