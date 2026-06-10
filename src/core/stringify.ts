import type { CSSEntries, CSSObject } from "../types.ts";

const camelToKebab = (prop: string): string => {
  if (prop.startsWith("--")) return prop;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
};

export const stringifyDeclarations = (css: CSSObject | CSSEntries): string => {
  const entries = Array.isArray(css) ? css : Object.entries(css);
  const lines: string[] = [];
  for (const [key, value] of entries) {
    lines.push(`${camelToKebab(key)}: ${value};`);
  }
  return lines.join(" ");
};

// Indent every non-empty line by one level (two spaces). Shared by the @layer
// and at-rule (variant parent) wrappers so nesting depth renders consistently.
export const indentLines = (css: string): string => {
  return css
    .split("\n")
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join("\n");
};
