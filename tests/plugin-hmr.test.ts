import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Rule } from "../src/types.ts";
import regexcss from "../src/vite.ts";

const rules: Rule[] = [[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]];

const RESOLVED_ID = "\0virtual:regexcss.css";

// Minimal stand-ins for the parts of the hotUpdate plugin context we touch.
interface MockModule {
  id: string;
}
const makeEnvironment = () => {
  const modules = new Map<string, MockModule>();
  const sent: unknown[] = [];
  const invalidated: MockModule[] = [];
  let invalidatedAll = false;
  return {
    modules,
    sent,
    invalidated,
    get invalidatedAll() {
      return invalidatedAll;
    },
    environment: {
      name: "client",
      moduleGraph: {
        getModuleById: (id: string) => modules.get(id),
        invalidateModule: (mod: MockModule) => {
          invalidated.push(mod);
        },
        invalidateAll: () => {
          invalidatedAll = true;
        },
      },
      hot: {
        send: (payload: unknown) => {
          sent.push(payload);
        },
      },
      logger: { error: () => {} },
    },
  };
};

type HotUpdateCtx = {
  type: "create" | "update" | "delete";
  file: string;
  timestamp: number;
  modules: MockModule[];
  read: () => string | Promise<string>;
};
type LoosePlugin = {
  configResolved: (c: { root: string; command?: string }) => Promise<void>;
  hotUpdate: (this: { environment: unknown }, ctx: HotUpdateCtx) => Promise<MockModule[] | undefined>;
};

describe("vite plugin hotUpdate", () => {
  let dir: string;
  let htmlPath: string;
  let tsPath: string;
  let plugin: LoosePlugin;
  let timestamp = 0;

  // Mirrors Vite's ctx.read (readModifiedFile): reads the file from disk, "" if gone.
  const readFromDisk = (file: string) => (): string => {
    try {
      return readFileSync(file, "utf8");
    } catch {
      return "";
    }
  };

  const callHotUpdate = (env: ReturnType<typeof makeEnvironment>, ctx: Partial<HotUpdateCtx> & { file: string }) =>
    plugin.hotUpdate.call(
      { environment: env.environment },
      { type: "update", timestamp: ++timestamp, modules: [], read: readFromDisk(ctx.file), ...ctx },
    );

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "regexcss-hmr-"));
    htmlPath = join(dir, "index.html");
    tsPath = join(dir, "app.ts");
    await writeFile(htmlPath, `<div class="m-1"></div>`, "utf8");
    await writeFile(tsPath, `el.className = "m-2";`, "utf8");
    plugin = regexcss({
      config: { rules, content: { include: ["*.html", "*.ts"] } },
    }) as unknown as LoosePlugin;
    await plugin.configResolved({ root: dir, command: "serve" });
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("leaves default HMR alone when the token set is unchanged", async () => {
    const env = makeEnvironment();
    // same tokens, different markup — utility CSS is unaffected
    await writeFile(htmlPath, `<span class="m-1">edited</span>`, "utf8");
    const result = await callHotUpdate(env, { file: htmlPath });
    expect(result).toBeUndefined();
    expect(env.sent).toHaveLength(0);
    expect(env.invalidated).toHaveLength(0);
  });

  it("refreshes the virtual module when tokens change in a non-html content file", async () => {
    const env = makeEnvironment();
    const virtualMod = { id: RESOLVED_ID };
    env.modules.set(RESOLVED_ID, virtualMod);
    await writeFile(tsPath, `el.className = "m-2 m-3";`, "utf8");
    const tsMod = { id: tsPath };
    const result = await callHotUpdate(env, { file: tsPath, modules: [tsMod] });
    expect(result).toContain(virtualMod);
    // the file's own modules keep their default HMR alongside the CSS refresh
    expect(result).toContain(tsMod);
    // soft update — no full reload
    expect(env.sent).toHaveLength(0);
  });

  it("invalidates CSS modules but defers to Vite's page reload for html files", async () => {
    const env = makeEnvironment();
    const virtualMod = { id: RESOLVED_ID };
    env.modules.set(RESOLVED_ID, virtualMod);
    await writeFile(htmlPath, `<div class="m-1 m-100"></div>`, "utf8");
    // html files have no modules in the graph — returning a list would suppress
    // Vite's built-in "html changed → page reload"
    const result = await callHotUpdate(env, { file: htmlPath, modules: [] });
    expect(result).toBeUndefined();
    expect(env.invalidated).toContain(virtualMod);
  });

  it("diffs against ctx.read() content, not a racy disk read", async () => {
    const env = makeEnvironment();
    const virtualMod = { id: RESOLVED_ID };
    env.modules.set(RESOLVED_ID, virtualMod);
    // disk still has the old content (editor truncate-then-write in flight);
    // ctx.read() — like Vite's readModifiedFile — yields the settled content
    const result = await callHotUpdate(env, {
      file: tsPath,
      modules: [{ id: tsPath }],
      read: () => `el.className = "m-2 m-100";`,
    });
    expect(result).toContain(virtualMod);
  });

  it("ignores updates to files outside the content globs", async () => {
    const env = makeEnvironment();
    const outside = join(dir, "notes.txt");
    await writeFile(outside, "m-99", "utf8");
    const result = await callHotUpdate(env, { file: outside });
    expect(result).toBeUndefined();
  });

  it("picks up tokens from newly created content files", async () => {
    const env = makeEnvironment();
    const virtualMod = { id: RESOLVED_ID };
    env.modules.set(RESOLVED_ID, virtualMod);
    const created = join(dir, "new.ts");
    await writeFile(created, `el.className = "m-7";`, "utf8");
    const result = await callHotUpdate(env, { file: created, type: "create" });
    expect(result).toContain(virtualMod);
  });

  it("drops tokens when a content file is deleted", async () => {
    const env = makeEnvironment();
    const virtualMod = { id: RESOLVED_ID };
    env.modules.set(RESOLVED_ID, virtualMod);
    await rm(tsPath);
    const result = await callHotUpdate(env, { file: tsPath, type: "delete" });
    expect(result).toContain(virtualMod);
  });

  it("reuses the token diff verdict across environments for the same event", async () => {
    const clientEnv = makeEnvironment();
    const ssrEnv = makeEnvironment();
    const clientMod = { id: RESOLVED_ID };
    const ssrMod = { id: RESOLVED_ID };
    clientEnv.modules.set(RESOLVED_ID, clientMod);
    ssrEnv.modules.set(RESOLVED_ID, ssrMod);

    await writeFile(tsPath, `el.className = "m-2 m-3";`, "utf8");
    const eventTimestamp = ++timestamp;
    const ctx: HotUpdateCtx = {
      type: "update",
      file: tsPath,
      timestamp: eventTimestamp,
      modules: [],
      read: readFromDisk(tsPath),
    };
    const clientResult = await plugin.hotUpdate.call({ environment: clientEnv.environment }, ctx);
    const ssrResult = await plugin.hotUpdate.call({ environment: ssrEnv.environment }, { ...ctx });
    expect(clientResult).toContain(clientMod);
    // the second environment must see the same "changed" verdict even though the
    // per-file token update already happened during the first environment's pass
    expect(ssrResult).toContain(ssrMod);
  });
});
