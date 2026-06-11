import type { EnvironmentModuleNode, Plugin, ViteDevServer } from "vite";
import { loadUserConfig } from "../config/load.ts";
import { createGenerator } from "../core/generator.ts";
import { resolveFiles, scanFiles } from "../extractor/scan.ts";
import type { GenerateWarning, Generator, UserConfig } from "../types.ts";

const VIRTUAL_ID = "virtual:regexcss.css";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// CSS @import pattern with optional `layer(name)`:
//   @import "regexcss";
//   @import "regexcss" layer(website.utilities);
//   @import "regexcss" layer("website.utilities");
// (Tailwind v4 style — embeds generated CSS directly inside a user CSS file.)
// Layer content excludes `(` as well as `)`: a CSS `<layer-name>` never contains
// parens, and excluding `(` stops `[^…]+` from scanning across the whole input on
// pathological strings like `@import "regexcss" layer((…` (CodeQL js/polynomial-redos).
const CSS_IMPORT_RE = /@import\s+["']regexcss["'](?:\s+layer\(([^()]+)\))?;?/g;

export interface PluginOptions {
  config?: UserConfig;
}

const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
};

export default function regexcss(options: PluginOptions = {}): Plugin {
  let root = process.cwd();
  let isDev = false;
  let server: ViteDevServer | undefined;
  let generator: Generator | undefined;
  // Tokens per content file. Kept per-file so a change event only re-extracts the
  // changed file instead of re-reading the whole content tree.
  let fileTokens: Map<string, Set<string>> = new Map();
  // Union of all per-file token sets — the actual generate() input. Replaced (never
  // mutated) on every recompute so callers can diff by reference snapshot.
  let tokens: Set<string> = new Set();
  let configSources: string[] = [];
  // Files currently matched by the content globs (absolute paths), refreshed on every scan.
  let contentFiles: Set<string> = new Set();
  let scanDirty = true;
  let scanPromise: Promise<void> | undefined;
  // CSS module ids whose transform inlined generated CSS — these must be refreshed
  // (alongside the virtual module) whenever the token set changes.
  const cssImporters = new Set<string>();
  // `hotUpdate` runs once per environment (client, ssr, …). These memos make the
  // expensive work — config rebuild, rescan + token diff — happen once per file event
  // while every environment still acts on the same verdict.
  let lastConfigReloadKey: string | undefined;
  let lastTokenDiff: { key: string; changed: boolean } | undefined;
  let configReloadPromise: Promise<void> | undefined;
  // Tokens already warned about — generate() re-reports cached warnings on every call,
  // so without this every HMR pass would repeat them. Cleared on config rebuild.
  const warnedTokens = new Set<string>();

  // Forward generator diagnostics (variant group collisions etc.) to the Vite log,
  // once per token. `logger` is the per-environment logger from the hook context.
  const logWarnings = (warnings: GenerateWarning[], logger: { warn(msg: string): void } | undefined): void => {
    if (!logger) return;
    for (const w of warnings) {
      if (warnedTokens.has(w.token)) continue;
      warnedTokens.add(w.token);
      logger.warn(`[regexcss] token "${w.token}": ${w.message}`);
    }
  };

  const invalidateScanCache = (): void => {
    scanDirty = true;
  };

  const recomputeTokens = (): void => {
    const next = new Set<string>();
    for (const set of fileTokens.values()) {
      for (const t of set) next.add(t);
    }
    tokens = next;
  };

  // Rescan content files for tokens. Deduplicates concurrent callers via a shared
  // in-flight promise, and loops so an invalidation landing mid-scan triggers a
  // follow-up scan — on return, `tokens` reflects every invalidation seen so far.
  const rescanTokens = async (): Promise<void> => {
    if (!generator) return;
    while (scanDirty || scanPromise) {
      if (scanPromise) {
        await scanPromise;
        continue;
      }
      scanDirty = false;
      const gen = generator;
      scanPromise = (async () => {
        const files = await resolveFiles(gen.config.content, root);
        contentFiles = new Set(files);
        fileTokens = await scanFiles(files, gen.config.extractor);
        recomputeTokens();
      })().finally(() => {
        scanPromise = undefined;
      });
      await scanPromise;
    }
  };

  const buildGenerator = async (): Promise<void> => {
    let userConfig: UserConfig | undefined = options.config;
    if (!userConfig) {
      const loaded = await loadUserConfig(root);
      userConfig = loaded.config;
      configSources = loaded.sources;
    }
    if (!userConfig) {
      generator = undefined;
      fileTokens = new Map();
      tokens = new Set();
      contentFiles = new Set();
      return;
    }
    generator = createGenerator(userConfig);
    warnedTokens.clear();
    invalidateScanCache();
    await rescanTokens();
  };

  const rebuildGenerator = (): Promise<void> => {
    configReloadPromise ??= buildGenerator().finally(() => {
      configReloadPromise = undefined;
    });
    return configReloadPromise;
  };

  // Register config sources and every scanned content file with the watcher.
  // Root-external content files are outside Vite's default watch scope, so the
  // explicit registration is required for change events to reach us at all.
  //
  // In dev this MUST go through server.watcher.add, not this.addWatchFile:
  // Vite's css-analysis plugin turns files added via addWatchFile during a CSS
  // module's load/transform into file-only *dependency modules* of that CSS.
  // That makes getModulesByFile(<content file>) non-empty, which permanently
  // disables Vite's built-in "html changed → page reload" (it only fires when
  // no modules match) — the browser would keep the old markup while the CSS
  // updates. watcher.add watches without touching the module graph.
  const watchAll = (addWatchFile: (id: string) => void): void => {
    const register = isDev && server ? (f: string) => server?.watcher.add(f) : addWatchFile;
    for (const source of configSources) register(source);
    for (const file of contentFiles) register(file);
  };

  return {
    name: "regexcss",
    enforce: "pre",

    async configResolved(c) {
      root = c.root;
      isDev = c.command === "serve";
      await buildGenerator();
    },

    configureServer(s) {
      server = s;
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return undefined;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      if (!generator) return "/* regexcss: no config loaded */";
      await rescanTokens();
      const { css, warnings } = await generator.generate(tokens);
      logWarnings(warnings, this.environment?.logger);
      watchAll((f) => this.addWatchFile(f));
      return css;
    },

    // CSS @import "regexcss"; を実 CSS に inline 展開（Tailwind v4 風）
    // `layer(name)` 構文に対応：CSS 側で指定された name は config.layerName を上書き
    async transform(code, id) {
      if (id === RESOLVED_ID) return null;
      // module ids may carry a query (`/main.css?direct`) — match on the file part
      const file = id.split("?", 1)[0] ?? id;
      if (!file.endsWith(".css")) return null;
      if (file.includes("/node_modules/")) return null;
      if (!generator) return null;
      if (!CSS_IMPORT_RE.test(code)) {
        // this file (no longer) embeds generated CSS — drop it from the refresh list
        cssImporters.delete(id);
        return null;
      }
      CSS_IMPORT_RE.lastIndex = 0;
      cssImporters.add(id);

      await rescanTokens();
      watchAll((f) => this.addWatchFile(f));

      // 同一ファイル内に複数の @import がある場合も layer 別に1度だけ generate
      const blocks = new Map<string | undefined, string>();
      const matches = [...code.matchAll(CSS_IMPORT_RE)];
      CSS_IMPORT_RE.lastIndex = 0;
      for (const m of matches) {
        const key = m[1]?.trim().replace(/^["']|["']$/g, "");
        if (blocks.has(key)) continue;
        const { css, warnings } = await generator.generate(tokens, key !== undefined ? { layerName: key } : undefined);
        logWarnings(warnings, this.environment?.logger);
        blocks.set(key, css);
      }

      // 生成CSSは「その場」ではなくファイル末尾（= 全 @import の後ろ）へ差し込む。
      // インライン展開だと、後続の `@import` が生成済みの実ルールより後ろに押し出され、
      // 「@import は @charset / @layer 文以外の全ルールより前」という CSS 仕様に反して
      // Lightning CSS が `@import rules must precede all rules ...` で落ちるため。
      // layer 指定時のカスケード順は冒頭の `@layer name, ...;` 宣言で確定するので、
      // 生成ブロックの物理位置には依存しない。
      CSS_IMPORT_RE.lastIndex = 0;
      const withoutImports = code.replace(CSS_IMPORT_RE, "");
      const generated = [...blocks.values()].filter((css) => css.length > 0).join("\n\n");
      const out = generated ? `${withoutImports.trimEnd()}\n\n${generated}\n` : withoutImports;
      return { code: out, map: null };
    },

    // Build --watch has no hotUpdate hook; mark the scan dirty so the next
    // load/transform of the rebuild picks up fresh tokens. In dev, hotUpdate owns
    // invalidation (it updates only the changed file's tokens) — a full-rescan here
    // would clobber that targeted update with a racy raw readFile of the same file.
    watchChange(id, { event }) {
      if (isDev) return;
      if (event !== "update" || contentFiles.has(id)) invalidateScanCache();
    },

    async hotUpdate(ctx) {
      if (configSources.includes(ctx.file)) {
        const key = `${ctx.timestamp}:${ctx.file}`;
        if (lastConfigReloadKey !== key) {
          lastConfigReloadKey = key;
          try {
            await rebuildGenerator();
          } catch (error) {
            this.environment.logger.error(
              `[regexcss] failed to reload config from ${ctx.file} — keeping the previous config.\n${String(error)}`,
            );
          }
        }
        // A config change can alter any generated CSS anywhere; nuke the module
        // graph for this environment and reload.
        this.environment.moduleGraph.invalidateAll();
        this.environment.hot.send({ type: "full-reload" });
        return [];
      }

      if (!generator) return;
      const gen = generator;
      // Only react to files we actually scan. create/delete may change the glob
      // result set itself, so those always go through a rescan to find out.
      if (ctx.type === "update" && !contentFiles.has(ctx.file)) return;

      const key = `${ctx.timestamp}:${ctx.file}:${ctx.type}`;
      if (lastTokenDiff?.key !== key) {
        const before = tokens;
        if (ctx.type === "delete") {
          contentFiles.delete(ctx.file);
          fileTokens.delete(ctx.file);
          recomputeTokens();
        } else {
          if (ctx.type === "create") {
            // the glob result set may have changed — re-glob and rescan from disk
            invalidateScanCache();
            await rescanTokens();
          }
          if (contentFiles.has(ctx.file)) {
            // Re-extract only the changed file, through ctx.read(): unlike a raw
            // readFile it waits out editors that truncate the file before writing,
            // so the diff below is never computed from half-written content.
            const code = await ctx.read();
            fileTokens.set(ctx.file, new Set(gen.config.extractor(code)));
            recomputeTokens();
          }
        }
        lastTokenDiff = { key, changed: !setsEqual(before, tokens) };
      }
      // Utility token set unchanged → leave the default HMR for this file as-is.
      // This is the common case (edits that don't touch class lists) and keeps
      // fine-grained HMR + state preservation working.
      if (!lastTokenDiff.changed) return;

      // Token set changed → every module embedding generated CSS must refresh.
      const extra: EnvironmentModuleNode[] = [];
      for (const id of [RESOLVED_ID, ...cssImporters]) {
        const mod = this.environment.moduleGraph.getModuleById(id);
        if (mod) extra.push(mod);
      }
      if (extra.length === 0) return;

      // An .html content file usually isn't a module in the graph. Returning a
      // module list for it would suppress Vite's built-in "html changed → page
      // reload", leaving the browser on the old markup (without the new class).
      // Instead, invalidate the CSS modules so the reloaded page re-generates
      // them, and let Vite's default html handling send the full reload.
      if (ctx.file.endsWith(".html") && ctx.modules.length === 0) {
        for (const mod of extra) {
          this.environment.moduleGraph.invalidateModule(mod, new Set(), ctx.timestamp, true);
        }
        return;
      }
      return [...ctx.modules, ...extra];
    },
  };
}
