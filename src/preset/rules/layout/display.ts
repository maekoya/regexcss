import type { CSSObject, Rule } from "../../../types.ts";

// Display utilities — https://tailwindcss.com/docs/display
// class name -> CSS `display` value (most are identical; `hidden` maps to `none`).
const DISPLAY: Record<string, string> = {
  inline: "inline",
  block: "block",
  "inline-block": "inline-block",
  "flow-root": "flow-root",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  "inline-grid": "inline-grid",
  contents: "contents",
  table: "table",
  "inline-table": "inline-table",
  "table-caption": "table-caption",
  "table-cell": "table-cell",
  "table-column": "table-column",
  "table-column-group": "table-column-group",
  "table-footer-group": "table-footer-group",
  "table-header-group": "table-header-group",
  "table-row-group": "table-row-group",
  "table-row": "table-row",
  "list-item": "list-item",
  hidden: "none",
};

// Screen-reader only — visually hide while keeping content accessible.
const srOnly: CSSObject = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  "white-space": "nowrap",
  "border-width": "0",
};

const notSrOnly: CSSObject = {
  position: "static",
  width: "auto",
  height: "auto",
  padding: "0",
  margin: "0",
  overflow: "visible",
  clip: "auto",
  "white-space": "normal",
};

export const displayRules: Rule[] = [
  ...Object.entries(DISPLAY).map(([name, value]): Rule => [new RegExp(`^${name}$`), () => ({ display: value })]),
  [/^sr-only$/, () => srOnly],
  [/^not-sr-only$/, () => notSrOnly],
];
