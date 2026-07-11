import { readFile } from "node:fs/promises";
import { build, context } from "esbuild";

// Bundle the extension to a single, self-contained CJS file for the VSCode extension
// host. `vscode` is provided by the host and stays external; everything else —
// regexcss (ESM), unconfig, jiti and their deps — gets bundled in, so the packaged
// `.vsix` needs no node_modules at runtime.
//
// Two things need help to bundle cleanly:
//
// 1. `import.meta.url` — unconfig (and friends) call `createRequire(import.meta.url)`,
//    which is undefined in a CJS bundle. Map it to a value derived from the CJS
//    `__filename` via a banner.
//
// 2. jiti — unconfig loads it to transpile the user's TS config. At runtime jiti does
//    `createRequire(import.meta.url)("../dist/babel.cjs")`, a relative require that
//    can't be resolved once bundled. Rewrite that line to a plain
//    `require("../dist/babel.cjs")` so esbuild bundles babel.cjs in too. (Same trick
//    the Tailwind CSS IntelliSense language server uses.)
const patchJiti = {
  name: "patch-jiti",
  setup(build) {
    build.onLoad({ filter: /jiti\/lib\/jiti\.mjs$/ }, async (args) => {
      const original = await readFile(args.path, "utf8");
      return {
        contents: original.replace(
          'createRequire(import.meta.url)("../dist/babel.cjs")',
          'require("../dist/babel.cjs")',
        ),
      };
    });
  },
};

const options = {
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.cjs",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  external: ["vscode"],
  define: { "import.meta.url": "__import_meta_url" },
  banner: { js: "const __import_meta_url = require('url').pathToFileURL(__filename).href;" },
  plugins: [patchJiti],
  sourcemap: true,
  minify: !process.argv.includes("--watch"),
};

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("esbuild: watching…");
} else {
  await build(options);
  console.log("esbuild: built dist/extension.cjs");
}
