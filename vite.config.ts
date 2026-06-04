import { defineConfig } from "vite-plus";
import tsdownConfig from "./tsdown.config.ts";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    printWidth: 120,
    sortPackageJson: true,
    sortImports: {
      newlinesBetween: false,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  pack: tsdownConfig,
});
