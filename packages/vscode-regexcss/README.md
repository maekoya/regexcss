# regexcss IntelliSense (VSCode)

A VSCode extension for [regexcss](https://github.com/maekoya/regexcss). It reads your
project's `regexcss.config` and provides **hover previews** and **completion** for
class names.

Because regexcss is regex-driven, **any class that matches a rule can be hovered** —
including dynamic values that no finite class list could enumerate (`mt-73`, `w-1/3`, …).

> **Prerequisite:** `regexcss.config` itself imports `regexcss` (`regexcss/preset/tailwind`, etc.),
> so **`regexcss` must be installed in your project**. In a project without a config — or
> with a config whose `content.include` is empty — the extension stays dormant and does
> nothing.

## Which files are active

The extension is active only in files matched by a config's `content.include` globs
(minus `content.exclude`) — **the same files the Vite plugin scans**. This is the
**only** gate: the file's language does not matter (`.php`, `.md`, custom template
extensions just work when they are in the include).

- Every `regexcss.config.{ts,mts,js,mjs,cjs}` in the workspace is discovered, and the
  config whose `content.include` matches the current file governs it. Include patterns
  may reach above the config's own directory (`"../shared/**/*.html"` works).
- When several configs match, the one nearest to the file wins (a package's config
  beats the monorepo root's).
- An empty or absent `content.include` means the config governs **no** files — strict
  parity with the plugin, which scans nothing in that case.
- Files outside any workspace folder are always dormant.

## Features

- **Hover** — hover a class inside `class="…"` / `className="…"` in any
  `content.include`-matched file to see the CSS it generates, variants and at-rules included
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

All of them. Completion's class-attribute detection is text-based (see
`regexcss.classAttributes`), so any language works — which files are active is decided
by `content.include` alone. There is no language setting: to narrow where IntelliSense
appears, narrow `content.include`/`content.exclude` in your config, which keeps the
extension and the Vite plugin in lockstep.

## Settings

| Setting                    | Default                                            | Description                                                                                                                                                                                                                                                    |
| -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `regexcss.configPath`      | `""` (auto-discover)                               | Path to the config, relative to the workspace folder. Empty = auto-discover: the config in the workspace whose `content.include` matches the current file governs it. Even with an explicit path, the file must be matched by that config's `content.include`. |
| `regexcss.classAttributes` | `class` / `className` / `class:list` / `classList` | Attribute names whose string values are treated as class lists for completion.                                                                                                                                                                                 |
