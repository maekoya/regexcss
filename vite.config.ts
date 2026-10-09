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
    overrides: [
      {
        // README snippets open with a `// filename` comment that import sorting would displace
        files: ["**/*.md"],
        options: { sortImports: false },
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts", "packages/*/tests/**/*.test.ts"],
    snapshotSerializers: ["./tests/serializers/css.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/vite.ts", "src/types.ts", "src/**/*.test.ts", "src/preset/test-helpers.ts"],
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  pack: tsdownConfig,
});
