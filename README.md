# Regexcss

English | [日本語](./README.ja.md)

> [!WARNING]
> **Under active development — not intended for production use.** APIs, presets, and behavior may change without notice.

Zero-preset CSS utility engine powered by user-defined regex rules.

regexcss generates atomic CSS from class names found in your source files. It ships with **no default rules** — every utility is defined by you, as a pair of a regular expression and a CSS-generating function.

## Features

- **Zero preset** — nothing is generated unless you define a rule for it
- **Regex rules** — ``[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]`` and you're done
- **Variants** — `hover:`, `md:`, or anything else you define, with media query / selector transforms
- **Vite plugin** — scans your content and serves the generated CSS as a virtual module
- **Opt-in presets** — Tailwind-flavored rule sets (`spacing`, `layout`, `typography`, ...) you can spread in when you want a head start

## Installation

```sh
npm install -D regexcss
```

> [!NOTE]
> Requires **Node.js 20 or later**. The Vite plugin requires **Vite 8 or later** (declared as an optional peer dependency).

## Quick start

**1. Add the Vite plugin**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import regexcss from "regexcss/vite";

export default defineConfig({
  plugins: [regexcss()],
});
```

**2. Define your rules**

```ts
// regexcss.config.ts
import { defineConfig } from "regexcss";

export default defineConfig({
  content: {
    include: ["./index.html", "./src/**/*.{ts,tsx}"],
  },
  rules: [
    [/^m-(\d+)$/, ([, n]) => ({ margin: `${Number(n) / 4}rem` })],
    [/^text-(left|center|right)$/, ([, align]) => ({ "text-align": align })],
  ],
  variants: [
    { prefix: "hover", selector: ":hover" },
    { prefix: "md", parent: "@media (min-width: 768px)" },
  ],
});
```

Variants are plain objects (`prefix` + optional `selector` / `parent` / `group`).
For matches a literal prefix can't express, pass a raw `[RegExp, handler]` tuple instead.

**3. Import the generated CSS**

```css
/* main.css */
@import "regexcss" layer(utilities);
```

Now `class="m-4 hover:text-center"` in your content produces exactly the CSS you defined — nothing more.

## CLI — class reference docs

`regexcss docs` generates a self-contained HTML page listing every class your config defines, with the CSS each one produces:

```sh
npx regexcss docs
```

| Flag                  | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `-c, --config <path>` | Config file (default: auto-discover `regexcss.config.{ts,mts,js,mjs,cjs}`) |
| `-o, --out <path>`    | Output HTML file (default: `regexcss-docs.html`)                           |
| `--json`              | Print the docs data as JSON to stdout instead of writing HTML              |
| `--max-number <n>`    | Upper bound when expanding `\d+` from rule regexes (default: `12`)         |
| `--max-classes <n>`   | Max classes documented per rule (default: `100`, `0` = no cap)             |
| `--title <text>`      | HTML page title                                                            |

Classes are enumerated from each rule's regex when the pattern is finite (literals, alternations, small character classes, `\d+` bounded by `--max-number`). For open-ended patterns — or to document a dynamic rule compactly instead of listing every class — attach `samples` to the rule as an optional third tuple element. Each sample is a `{ class, style }` pair shown verbatim in the docs:

```ts
rules: [
  [
    /^m-(\d+)$/,
    ([, n]) => ({ margin: `${Number(n) / 4}rem` }),
    {
      samples: [{ class: "m-<num>", style: "margin: <num/4>rem;" }],
      label: "margin",
      category: "spacing",
      tags: ["brand"],
    },
  ],
],
```

### Preset caps

Preset rules with numeric scales are capped so they stay enumerable (and out-of-range classes like `m-9999` no longer match). Each capped preset ships a factory to tune the bound:

```ts
import { createSpacingRules, createSizingRules, createZIndexRules } from "regexcss/preset";

rules: [
  ...createSpacingRules({ max: 32 }), // default 96 (margin, padding)
  ...createSizingRules({ max: 64 }),  // default 96 (w, h, min-*, max-*, size)
  ...createZIndexRules({ max: 100 }), // default 50
],
```

Defaults: `spacing` / `gap` / `sizing` → 96, `grid-cols` / `grid-rows` / `row-*` / `order` → 12, `z-index` → 50, `line-clamp` → 6. The plain rule arrays (`spacingRules`, ...) use the defaults.

## Entry points

| Import             | What you get                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| `regexcss`         | `defineConfig`, `createGenerator`, types                                  |
| `regexcss/vite`    | The Vite plugin                                                           |
| `regexcss/helpers` | Unit helpers (`rem`, `px`, ...), `@custom-media` parsers, `createVariant` |
| `regexcss/preset`  | Optional Tailwind-flavored rule sets (`spacingRules`, `layoutRules`, ...) |

## Example

See [`examples/basic-vite`](./examples/basic-vite) for a working setup with presets, custom rules, and variants.

## License

MIT © 2026 maekoya
