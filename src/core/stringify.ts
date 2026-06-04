import type { CSSObject } from "../types.ts";

const camelToKebab = (prop: string): string => {
  if (prop.startsWith("--")) return prop;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
};

export const stringifyDeclarations = (css: CSSObject): string => {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(css)) {
    lines.push(`${camelToKebab(key)}: ${value};`);
  }
  return lines.join(" ");
};
