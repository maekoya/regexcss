import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    vite: "src/vite.ts",
    helpers: "src/helpers.ts",
    preset: "src/preset/index.ts",
    cli: "src/cli.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  exports: true,
  deps: {
    neverBundle: ["unconfig", "tinyglobby"],
  },
});
