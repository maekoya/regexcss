# Regexcss

English | [日本語](./README.ja.md)

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
import { createVariant } from "regexcss/helpers";

export default defineConfig({
  content: {
    include: ["./index.html", "./src/**/*.{ts,tsx}"],
  },
  rules: [
    [/^m-(\d+)$/, ([, n]) => ({ margin: `${Number(n) / 4}rem` })],
    [/^text-(left|center|right)$/, ([, align]) => ({ "text-align": align })],
  ],
  variants: [
    createVariant("hover", { selector: ":hover" }),
    createVariant("md", { parent: "@media (min-width: 768px)" }),
  ],
});
```

**3. Import the generated CSS**

```css
/* main.css */
@import "regexcss" layer(utilities);
```

Now `class="m-4 hover:text-center"` in your content produces exactly the CSS you defined — nothing more.

## Entry points

| Import             | What you get                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| `regexcss`         | `defineConfig`, `createGenerator`, types                                  |
| `regexcss/vite`    | The Vite plugin                                                           |
| `regexcss/helpers` | `createVariant`, unit helpers (`rem`, `px`, ...), `@custom-media` parsers |
| `regexcss/preset`  | Optional Tailwind-flavored rule sets (`spacingRules`, `layoutRules`, ...) |

## Example

See [`examples/basic-vite`](./examples/basic-vite) for a working setup with presets, custom rules, and variants.

## License

MIT © 2026 maekoya
