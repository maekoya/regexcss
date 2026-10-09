import { defineConfig } from "regexcss";
import { tailwindPreset } from "regexcss/preset/tailwind";

export default defineConfig({
  content: {
    include: ["./index.html"],
  },
  rules: [
    ...tailwindPreset({
      include: ["spacing", "layout", "typography"],
      options: {
        spacing: { excludeNegativeClasses: true },
      },
    }),
    [
      /^text-(2xs|xs|sm|base|lg|xl|2xl|3xl)$/,
      ([, size]) => ({
        "font-size": `var(--text-${size})`,
        "line-height": `var(--text-${size}-lh)`,
      }),
    ],
  ],
  variants: [
    // parent uses a custom media query — it survives the sass pass untouched and is
    // resolved later by Lightning CSS (see customMedia.css / vite.config.ts)
    { prefix: "sm", parent: "@media (--sm)", group: "window-size" },
    { prefix: "md", parent: "@media (--md)", group: "window-size" },
    { prefix: "hover", selector: ":hover", parent: "@media (any-hover: hover)" },
  ],
});
