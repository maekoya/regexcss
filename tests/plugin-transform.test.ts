import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Rule } from "../src/types.ts";
import regexcss from "../src/vite.ts";

const rules: Rule[] = [[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]];

type TransformCtx = {
  addWatchFile: (id: string) => void;
  error: (msg: string) => never;
  environment?: { logger: { info: (msg: string) => void; warn: (msg: string) => void } };
};
type LoosePlugin = {
  configResolved: (c: { root: string }) => Promise<void>;
  transform: (this: TransformCtx, code: string, id: string) => Promise<{ code: string } | null>;
};

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "regexcss-plugin-"));
  // a source file with a utility token so the generator emits real CSS
  await writeFile(join(dir, "index.html"), `<div class="m-1"></div>`, "utf8");
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

const makePlugin = async (): Promise<LoosePlugin> => {
  const plugin = regexcss({ config: { rules, content: { include: ["*.html"] } } }) as unknown as LoosePlugin;
  await plugin.configResolved({ root: dir });
  return plugin;
};

const makeCtx = (warns: string[] = []): TransformCtx => ({
  addWatchFile() {},
  error(msg) {
    throw new Error(msg);
  },
  environment: { logger: { info() {}, warn: (msg) => warns.push(msg) } },
});

const transform = (plugin: LoosePlugin, code: string, id = join(dir, "main.css"), ctx = makeCtx()) =>
  plugin.transform.call(ctx, code, id);

describe("vite plugin transform — @import ordering", () => {
  it("appends generated CSS after a trailing @import so @import stays first", async () => {
    const plugin = await makePlugin();
    const input = [
      "@layer website.base,website.utilities;",
      "",
      `@import "./customMedia.css";`,
      `@import "regexcss" layer(website.utilities);`,
      `@import "./test.css" layer(website.base);`,
      "",
    ].join("\n");

    const res = await transform(plugin, input);
    const out = res?.code ?? "";

    // the regexcss import directive itself is removed
    expect(out).not.toMatch(/@import\s+["']regexcss["']/);
    // generated CSS lands in its declared layer
    expect(out).toContain("@layer website.utilities {");
    expect(out).toContain(".m-1 { margin: 1px; }");
    // the other real @imports are untouched
    expect(out).toContain(`@import "./customMedia.css";`);
    expect(out).toContain(`@import "./test.css" layer(website.base);`);

    // every remaining @import precedes the generated rules (CSS spec / Lightning CSS)
    const lastImport = out.lastIndexOf("@import ");
    const firstGenerated = out.indexOf("@layer website.utilities {");
    expect(lastImport).toBeGreaterThanOrEqual(0);
    expect(firstGenerated).toBeGreaterThan(lastImport);
  });

  it("is a no-op (returns null) when no regexcss import is present", async () => {
    const plugin = await makePlugin();
    const res = await transform(plugin, `@import "./a.css";\n.foo { color: red; }\n`);
    expect(res).toBeNull();
  });
});

// The plugin runs at `enforce: "pre"`, so preprocessor sources reach transform before
// sass/less run and SFC <style> blocks arrive as `App.vue?…&lang.<ext>`. Anything not
// matched here keeps its literal `@import "regexcss"`, which Vite then resolves to this
// package's JS entry — Lightning CSS dies on it with `Unexpected token Ident("as")`.
describe("vite plugin transform — which module ids get expanded", () => {
  const source = `@import "regexcss";\n.foo { color: red; }\n`;

  const expandsIn = async (id: string): Promise<boolean> => {
    const plugin = await makePlugin();
    const res = await transform(plugin, source, id);
    if (res === null) return false;
    expect(res.code).not.toMatch(/@import\s+["']regexcss["']/);
    expect(res.code).toContain(".m-1 { margin: 1px; }");
    return true;
  };

  it.each([
    ["main.css", "main.css"],
    [".scss", "main.scss"],
    [".less", "main.less"],
    [".pcss", "main.pcss"],
    [".postcss", "main.postcss"],
    ["a query-carrying css id", "main.css?direct"],
  ])("expands in %s", async (_label, name) => {
    expect(await expandsIn(join(dir, name))).toBe(true);
  });

  it.each([
    ["a plain <style> block", "App.vue?vue&type=style&index=0&lang.css"],
    ["a lang=scss <style> block", "App.vue?vue&type=style&index=0&lang.scss"],
    ["a svelte style block", "App.svelte?svelte&type=style&lang.css"],
  ])("expands in %s", async (_label, name) => {
    expect(await expandsIn(join(dir, name))).toBe(true);
  });

  it.each([
    ["a JS module", "main.ts"],
    ["an html file", "index.html"],
    ["an extensionless id", "somefile"],
    ["a ?raw request", "main.scss?raw"],
    ["a ?url request", "main.scss?url"],
  ])("leaves %s untouched", async (_label, name) => {
    const plugin = await makePlugin();
    expect(await transform(plugin, source, join(dir, name))).toBeNull();
  });

  it("leaves node_modules stylesheets untouched", async () => {
    const plugin = await makePlugin();
    expect(await transform(plugin, source, join(dir, "node_modules/ui/style.scss"))).toBeNull();
  });

  it.each(["main.sass", "main.styl", "main.sss", "App.vue?vue&type=style&index=0&lang.sass"])(
    "errors with a pointer to the virtual module for %s",
    async (name) => {
      const plugin = await makePlugin();
      // braces are a syntax error in these — inlining generated CSS is not an option
      await expect(transform(plugin, source, join(dir, name))).rejects.toThrow(
        /indentation-based style syntax[\s\S]*virtual:regexcss\.css/,
      );
    },
  );

  it("warns once when the import comes from a scoped <style> block", async () => {
    const plugin = await makePlugin();
    const warns: string[] = [];
    const ctx = makeCtx(warns);
    const id = join(dir, "App.vue?vue&type=style&index=0&scoped=true&lang.css");
    await transform(plugin, source, id, ctx);
    await transform(plugin, source, id, ctx);
    expect(warns.filter((w) => w.includes("scoped <style> block"))).toHaveLength(1);
  });
});
