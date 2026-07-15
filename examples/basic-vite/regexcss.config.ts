import { defineConfig } from "regexcss";
import { tailwindPreset } from "regexcss/preset/tailwind";

export default defineConfig({
  content: {
    include: ["./index.html"],
  },
  rules: [
    ...tailwindPreset({
      include: ["spacing", "layout", "typography", "flexbox-grid", "sizing"],
      options: {
        "typography/font-family": { sans: "var(--font-sans)", serif: "var(--font-serif)", mono: "var(--font-mono)" },
        sizing: { excludeContainerClasses: true },
        spacing: { excludeNegativeClasses: true },
      },
    }),
    [
      /^text-(2xs|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/,
      ([, size]) => ({
        "font-size": `var(--text-${size})`,
        "line-height": `var(--text-${size}-lh)`,
      }),
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
