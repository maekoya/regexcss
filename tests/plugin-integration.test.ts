import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createVariant } from "../src/helpers.ts";
import type { Rule } from "../src/types.ts";
import regexcss from "../src/vite.ts";

const rules: Rule[] = [[/^mt-(\d+)$/, ([, n]) => ({ "margin-top": `${n}px` })]];
const variants = [
  createVariant("sm", { parent: "@media (--sm)", group: "window-size" }),
  createVariant("md", { parent: "@media (--md)", group: "window-size" }),
];

// Real Vite dev server (middleware mode, no sockets) driving the actual
// watcher → hotUpdate → invalidate → re-transform pipeline. Regression test for
// "edit a class in index.html and the new style is not picked up".
describe("vite plugin end-to-end (dev server)", () => {
  let dir: string;
  let htmlPath: string;
  let server: ViteDevServer;
  let sent: Array<{ type: string }> = [];

  const cssCode = async (): Promise<string> => {
    // JS-wrapped CSS module in dev; the generated rules appear verbatim inside it
    const result = await server.transformRequest("/main.css");
    return result?.code ?? "";
  };

  // watcher events are fire-and-forget; poll the transform until it settles
  const waitForCss = async (needle: string): Promise<string> => {
    let code = "";
    for (let i = 0; i < 50; i++) {
      code = await cssCode();
      if (code.includes(needle)) return code;
      await new Promise((r) => setTimeout(r, 20));
    }
    return code;
  };

  const waitForPayload = async (type: string): Promise<boolean> => {
    for (let i = 0; i < 50; i++) {
      if (sent.some((p) => p.type === type)) return true;
      await new Promise((r) => setTimeout(r, 20));
    }
    return false;
  };

  beforeAll(async () => {
    // realpath: on macOS tmpdir() is a symlink (/tmp → /private/tmp); Vite resolves
    // ids to real paths, and a symlinked root makes its fs.allow check reject them
    dir = await realpath(await mkdtemp(join(tmpdir(), "regexcss-e2e-")));
    htmlPath = join(dir, "index.html");
    await writeFile(htmlPath, `<div class="mt-10"></div>`, "utf8");
    await writeFile(join(dir, "main.css"), `@import "regexcss";\n`, "utf8");
    server = await createServer({
      root: dir,
      configFile: false,
      logLevel: "silent",
      server: { middlewareMode: true, ws: false },
      plugins: [regexcss({ config: { rules, variants, content: { include: ["index.html"] } } })],
    });
    // record what Vite pushes to the (noop, ws-less) client hot channel
    const hot = server.environments.client.hot;
    const origSend = hot.send.bind(hot);
    hot.send = ((payload: { type: string }) => {
      sent.push(payload);
      origSend(payload as never);
    }) as typeof hot.send;
  });

  afterAll(async () => {
    await server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it("serves CSS for the initial tokens", async () => {
    const code = await cssCode();
    expect(code).toContain(".mt-10 { margin-top: 10px; }");
  });

  it("does not register content files as module-graph entries", () => {
    // Files registered via addWatchFile during a CSS transform become file-only
    // dependency modules of that CSS (vite:css-analysis) — which permanently
    // suppresses Vite's "html changed → page reload". Watching must stay
    // graph-neutral or html edits stop reaching the browser.
    const mods = server.environments.client.moduleGraph.getModulesByFile(htmlPath);
    expect(mods === undefined || mods.size === 0).toBe(true);
  });

  it("serves updated CSS and reloads the page after a class changes in index.html", async () => {
    sent = [];
    await writeFile(htmlPath, `<div class="mt-100"></div>`, "utf8");
    // simulate the fs event chokidar would emit for the write above
    server.watcher.emit("change", htmlPath);
    const code = await waitForCss(".mt-100");
    expect(code).toContain(".mt-100 { margin-top: 100px; }");
    expect(code).not.toContain(".mt-10 {");
    // the new markup carries the new class — without a page reload the browser
    // would keep showing the old DOM and the style would never appear
    expect(await waitForPayload("full-reload")).toBe(true);
  });

  it("still reloads the page when markup changes but tokens do not", async () => {
    sent = [];
    await writeFile(htmlPath, `<span class="mt-100">edited</span>`, "utf8");
    server.watcher.emit("change", htmlPath);
    expect(await waitForPayload("full-reload")).toBe(true);
    const code = await cssCode();
    expect(code).toContain(".mt-100 { margin-top: 100px; }");
  });

  it("logs a variant-group collision to the Vite logger, once per token", async () => {
    const warnLogs: string[] = [];
    const logger = server.environments.client.logger;
    const origWarn = logger.warn.bind(logger);
    logger.warn = (msg, opts) => {
      warnLogs.push(String(msg));
      origWarn(msg, opts);
    };

    await writeFile(htmlPath, `<div class="mt-100 md:sm:mt-5"></div>`, "utf8");
    server.watcher.emit("change", htmlPath);
    // poll: re-transform of main.css emits the warning via the environment logger
    for (let i = 0; i < 50 && warnLogs.length === 0; i++) {
      await cssCode();
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(warnLogs.some((m) => m.includes(`token "md:sm:mt-5"`) && m.includes(`"window-size"`))).toBe(true);

    // a second pass over the same token must not repeat the warning
    const count = warnLogs.length;
    await cssCode();
    expect(warnLogs.length).toBe(count);
    // and the colliding token produced no CSS
    expect(await cssCode()).not.toContain("md\\:sm");
  });
});
