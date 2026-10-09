import regexcss from "regexcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [regexcss()],
  css: {
    // The combination that used to blow up: an unexpanded `@import "regexcss"`
    // reaches Lightning CSS, which resolves it to the package's JS entry and dies
    // with `Unexpected token Ident("as")`.
    transformer: "lightningcss",
    lightningcss: {
      drafts: {
        customMedia: true,
      },
    },
  },
});
