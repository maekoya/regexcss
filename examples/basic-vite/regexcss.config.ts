import { type CSSObject, defineConfig } from "regexcss";
import { flexboxGridRules, layoutRules, spacingRules, typographyRules } from "regexcss/preset";

const COLOR_NAMES = ["blue", "red", "orange", "green", "teal", "purple", "pink", "gray"];

export default defineConfig({
  content: {
    include: ["./index.html"],
  },
  rules: [
    ...spacingRules,
    ...layoutRules,
    ...typographyRules,
    ...flexboxGridRules,
    [
      /^text-(2xs|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/,
      ([, size]) => ({
        "font-size": `var(--text-${size})`,
        "line-height": `var(--text-${size}-lh)`,
      }),
    ],
    [
      new RegExp(`^(text|bg)-(${COLOR_NAMES.join("|")})-(1[0-2]|[1-9])$`),
      ([, style, color, level]): CSSObject =>
        style === "text" ? { color: `var(--${color}-${level})` } : { "background-color": `var(--${color}-${level})` },
    ],
    [
      /^(text|bg)-(black|white)-a((?:1[012]?|[1-9]))$/,
      ([, style, color, level]): CSSObject =>
        style === "text" ? { color: `var(--${color}-a${level})` } : { "background-color": `var(--${color}-a${level})` },
    ],
    [
      /^text-(black|white)$/,
      ([, color]) => ({
        color: `var(--${color})`,
      }),
    ],
  ],
  variants: [
    // group: 同一トークン内で window-size 系 variant は1つまで（md:sm:〜 を弾く）
    {
      prefix: "md",
      parent: "@media (--md)",
      group: "window-size",
    },
    {
      prefix: "sm",
      parent: "@media (--sm)",
      group: "window-size",
    },
    {
      prefix: "hover",
      selector: ":hover",
      parent: "@media (any-hover: hover)",
    },
  ],
});
