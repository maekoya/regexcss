# regexcss IntelliSense (VSCode)

A VSCode extension for [regexcss](https://github.com/maekoya/regexcss). It reads your
project's `regexcss.config` and provides **hover previews** and **completion** for
class names.

Because regexcss is regex-driven, **any class that matches a rule can be hovered** —
including dynamic values that no finite class list could enumerate (`mt-73`, `w-1/3`, …).

> **Prerequisite:** `regexcss.config` itself imports `regexcss` (`regexcss/preset`, etc.),
> so **`regexcss` must be installed in your project**. In a project without a config — or
> with a config whose `content.include` is empty — the extension stays dormant and does
> nothing.

## Which files are active

The extension is active only in files matched by a config's `content.include` globs
(minus `content.exclude`) — **the same files the Vite plugin scans**:

- Every `regexcss.config.{ts,mts,js,mjs,cjs}` in the workspace is discovered, and the
  config whose `content.include` matches the current file governs it. Include patterns
  may reach above the config's own directory (`"../shared/**/*.html"` works).
- When several configs match, the one nearest to the file wins (a package's config
  beats the monorepo root's).
- An empty or absent `content.include` means the config governs **no** files — strict
  parity with the plugin, which scans nothing in that case.
- Files outside any workspace folder are always dormant.

## Features

- **Hover** — hover a class inside `class="…"` / `className="…"` (html, JS/TS/JSX/TSX,
  Vue, Svelte, Astro) to see the CSS it generates, variants and at-rules included
  (`md:m-2` → `@media (--md) { .md\:m-2 { margin: 0.5rem; } }`).
  - `rem` values are annotated with their **px equivalent** in a comment
    (`padding: 2rem; /* 32px */`; multiple values become `margin: 0.5rem 1rem; /* 8px 16px */`).
    Conversion assumes `1rem = 16px`.
- **Completion** — inside a class attribute, get concrete class names with a CSS preview.
  Candidates come from `enumerateClasses(config, { concrete: true })` (keyword utilities +
  numeric scales), filtered down to a clean, Tailwind-like set.
- **Auto-reload** — reloads automatically when `regexcss.config.*` or the extension
  settings change.

## Supported languages

`html` / `javascript` / `javascriptreact` / `typescript` / `typescriptreact` / `vue` /
`svelte` / `astro`

Customize the target languages with `regexcss.languages` — this **replaces** the default
list, so copy the defaults (the exact VS Code language identifiers above) and add or
remove entries as needed.

## Settings

| Setting                    | Default                                            | Description                                                                                                                                                                                                                                                    |
| -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `regexcss.configPath`      | `""` (auto-discover)                               | Path to the config, relative to the workspace folder. Empty = auto-discover: the config in the workspace whose `content.include` matches the current file governs it. Even with an explicit path, the file must be matched by that config's `content.include`. |
| `regexcss.classAttributes` | `class` / `className` / `class:list` / `classList` | Attribute names whose string values are treated as class lists for completion.                                                                                                                                                                                 |
| `regexcss.languages`       | the 8 defaults above                               | VSCode language identifiers to enable hover and completion for. **Replaces** the default list. Changes apply without a reload.                                                                                                                                 |
