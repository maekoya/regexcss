import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadUserConfig } from "../src/config/load.ts";
import regexcss from "../src/vite.ts";

const CONFIG_TS = `
export default {
  rules: [[/^m-(\\d+)$/, ([, n]) => ({ margin: \`\${n}px\` })]],
  content: { include: ["*.html"] },
};
`;

describe("loadUserConfig", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "regexcss-config-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("auto-discovers regexcss.config.ts at the cwd", async () => {
    await writeFile(join(dir, "regexcss.config.ts"), CONFIG_TS, "utf8");
    const { config, sources } = await loadUserConfig(dir);
    expect(config?.rules).toHaveLength(1);
    expect(sources[0]).toBe(join(dir, "regexcss.config.ts"));
  });

  it("loads an explicit configFile path verbatim (any name, any directory)", async () => {
    await mkdir(join(dir, "conf"));
    await writeFile(join(dir, "conf", "custom.regexcss.ts"), CONFIG_TS, "utf8");
    // a root-level config must NOT shadow the explicit one
    await writeFile(join(dir, "regexcss.config.ts"), `export default { rules: [] };`, "utf8");
    const { config, sources } = await loadUserConfig(dir, "conf/custom.regexcss.ts");
    expect(config?.rules).toHaveLength(1);
    expect(sources[0]).toBe(join(dir, "conf", "custom.regexcss.ts"));
  });

  it("returns no config when the explicit path does not exist", async () => {
    const { config, sources } = await loadUserConfig(dir, "conf/missing.ts");
    expect(config).toBeUndefined();
    expect(sources).toHaveLength(0);
  });
});

describe("vite plugin configFile option", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "regexcss-configfile-"));
    await writeFile(join(dir, "index.html"), `<div class="m-1"></div>`, "utf8");
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  type LoosePlugin = {
    configResolved: (c: { root: string; command?: string }) => Promise<void>;
    transform: (this: { addWatchFile(id: string): void }, code: string, id: string) => Promise<{ code: string } | null>;
  };

  it("drives the generator from the explicitly configured file", async () => {
    await mkdir(join(dir, "conf"));
    await writeFile(join(dir, "conf", "custom.regexcss.ts"), CONFIG_TS, "utf8");
    const plugin = regexcss({ configFile: "conf/custom.regexcss.ts" }) as unknown as LoosePlugin;
    await plugin.configResolved({ root: dir });
    const res = await plugin.transform.call({ addWatchFile() {} }, `@import "regexcss";`, join(dir, "main.css"));
    expect(res?.code).toContain(".m-1 { margin: 1px; }");
  });

  it("fails loudly when the explicit configFile is missing", async () => {
    const plugin = regexcss({ configFile: "conf/missing.ts" }) as unknown as LoosePlugin;
    await expect(plugin.configResolved({ root: dir })).rejects.toThrow(/configFile not found or empty/);
  });

  it("inline config takes precedence over configFile", async () => {
    await mkdir(join(dir, "conf"));
    await writeFile(join(dir, "conf", "custom.regexcss.ts"), CONFIG_TS, "utf8");
    const plugin = regexcss({
      config: {
        rules: [[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}rem` })]],
        content: { include: ["*.html"] },
      },
      configFile: "conf/custom.regexcss.ts",
    }) as unknown as LoosePlugin;
    await plugin.configResolved({ root: dir });
    const res = await plugin.transform.call({ addWatchFile() {} }, `@import "regexcss";`, join(dir, "main.css"));
    expect(res?.code).toContain(".m-1 { margin: 1rem; }");
  });
});
