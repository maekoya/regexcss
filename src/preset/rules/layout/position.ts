import type { Rule } from "../../../types.ts";

// position — https://tailwindcss.com/docs/position
export const positionRules: Rule[] = [
  [/^(static|fixed|absolute|relative|sticky)$/, ([, v]) => ({ position: v ?? "" })],
];
