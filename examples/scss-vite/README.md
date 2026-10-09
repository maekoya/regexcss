# regexcss × SCSS example

`@import "regexcss"` inside a `.scss` file, compiled by sass and then by Lightning CSS.

```sh
pnpm install          # from the repo root
pnpm --filter regexcss-example-scss dev
pnpm --filter regexcss-example-scss build
```

## What it covers

- **`@import "regexcss"` in `.scss`.** The plugin runs at `enforce: "pre"`, so it expands
  the import in the SCSS source, before sass runs. Until v0.3.11 only `.css` was matched
  and the import survived into Lightning CSS, which resolved `regexcss` to the package's
  JS entry and failed with `[lightningcss] Unexpected token Ident("as")`.
- **Real SCSS.** [`src/_tokens.scss`](src/_tokens.scss) is consumed through `@use`, and
  [`src/main.scss`](src/main.scss) uses a mixin plus `&` nesting — sass has to compile
  this file for the example to build at all.
- **Generated CSS surviving the sass pass.** Escaped class selectors (`.md\:mt-16`) and
  the `@media (--md)` custom media in the `md:` variant both go through sass untouched
  and are resolved afterwards by Lightning CSS ([`src/customMedia.css`](src/customMedia.css)).
- **Layer ordering.** `@layer website.base, website.utilities;` stays at the top of the
  file while the generated block is appended at the end, so the cascade order holds.

Indentation-based syntaxes (`.sass`, `.styl`, `.sss`) cannot host the generated CSS —
there are no braces to put it in. The plugin fails there with a pointer to
`import "virtual:regexcss.css"`, which works from any JS entry.
