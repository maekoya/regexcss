import regexcss from "regexcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [regexcss()],
  css: {
    transformer: "lightningcss",
    lightningcss: {
      drafts: {
        customMedia: true,
      },
    },
  },
});
