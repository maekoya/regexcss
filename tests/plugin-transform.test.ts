import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Rule } from "../src/types.ts";
import regexcss from "../src/vite.ts";

const rules: Rule[] = [[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]];

type TransformCtx = { addWatchFile: (id: string) => void };
type LoosePlugin = {
  configResolved: (c: { root: string }) => Promise<void>;
  transform: (this: TransformCtx, code: string, id: string) => Promise<{ code: string } | null>;
};

describe("vite plugin transform — @import ordering", () => {
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

  const transform = (plugin: LoosePlugin, code: string) =>
    plugin.transform.call({ addWatchFile() {} }, code, join(dir, "main.css"));

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
