# Development guide — regexcss IntelliSense

For user-facing features and settings, see [README.md](./README.md).

## Setup

```sh
vp install            # from the monorepo root — links regexcss (workspace:*)
```

## Build

Build in the order **regexcss core → extension** (the extension imports
`regexcss/config`, so the build fails if the core's dist is stale).

```sh
vp run --filter regexcss build          # core (produces dist/config.mjs, etc.)
vp run --filter vscode-regexcss build   # extension (esbuild → dist/extension.cjs)
```

## Debugging (F5)

Press **F5** in this extension folder, or run "Run regexcss Extension" from the
`.vscode/launch.json` set up at the monorepo root, to launch an Extension Development
Host. Open a project that has a `regexcss.config.ts` and try hover and completion. The
`preLaunchTask` builds the core and the extension automatically.

## Test

```sh
vp run --filter vscode-regexcss test    # unit tests for format / tokens / resolve
```

The pure logic ([format.ts](./src/format.ts) / [tokens.ts](./src/tokens.ts) /
[resolve.ts](./src/resolve.ts)) has no vscode dependency and can be unit-tested directly.

## How the bundle works (jiti / import.meta.url)

The extension is bundled into a single CJS file (`dist/extension.cjs`) by
[esbuild.mjs](./esbuild.mjs). Only `vscode` is external; regexcss, unconfig, jiti and
their deps are bundled in. Two things need special handling:

- **`import.meta.url`** — unconfig (and others) call `createRequire(import.meta.url)`,
  which is undefined in a CJS bundle. It's mapped to a value derived from the CJS
  `__filename` via a `define` + banner.
- **jiti** — unconfig uses it to transpile the user's TS config. At runtime jiti does a
  relative require, `createRequire(import.meta.url)("../dist/babel.cjs")`, which can't be
  resolved once bundled. The `patch-jiti` plugin rewrites that line to a plain
  `require("../dist/babel.cjs")` so `babel.cjs` gets bundled in too (the same trick the
  Tailwind CSS IntelliSense language server uses).

As a result `dist/extension.cjs` is a **self-contained file that needs no node_modules**,
and works even when packaged as a `.vsix` with `--no-dependencies`.

## Packaging / publishing

Create a `.vsix` ([@vscode/vsce](https://github.com/microsoft/vscode-vsce)):

```sh
vp run --filter vscode-regexcss package   # → vscode-regexcss-<version>.vsix
```
