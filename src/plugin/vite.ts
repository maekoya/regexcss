import { extname } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { loadUserConfig } from "../config/load.ts";
import { createGenerator } from "../core/generator.ts";
import { resolveFiles, scanFiles } from "../extractor/scan.ts";
import type { Generator, UserConfig } from "../types.ts";

const VIRTUAL_ID = "virtual:regexcss.css";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// CSS @import pattern with optional `layer(name)`:
//   @import "regexcss";
//   @import "regexcss" layer(website.utilities);
//   @import "regexcss" layer("website.utilities");
// (Tailwind v4 style — embeds generated CSS directly inside a user CSS file.)
const CSS_IMPORT_RE = /@import\s+["']regexcss["'](?:\s+layer\(([^)]+)\))?;?/g;

const CONTENT_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".astro",
  ".md",
  ".mdx",
]);

export interface PluginOptions {
  config?: UserConfig;
}

// Short TTL for the token scan cache. Within the same request lifecycle the
// transform + load hooks can both call rescanTokens; this avoids redundant
// disk reads while keeping HMR fully reactive (`invalidateScanCache()` is
// called from `handleHotUpdate` whenever content/config changes).
const SCAN_TTL_MS = 50;

export default function regexcss(options: PluginOptions = {}): Plugin {
  let root = process.cwd();
  let generator: Generator | undefined;
  let tokens: Set<string> = new Set();
  let configSources: string[] = [];
  let server: ViteDevServer | undefined;
  let lastScanAt = 0;

  const invalidateScanCache = (): void => {
    lastScanAt = 0;
  };

  const rescanTokens = async (): Promise<void> => {
    if (!generator) return;
    if (Date.now() - lastScanAt < SCAN_TTL_MS) return;
    const files = await resolveFiles(generator.config.content, root);
    tokens = await scanFiles(files, generator.config.extractor);
    lastScanAt = Date.now();
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
      tokens = new Set();
      return;
    }
    generator = createGenerator(userConfig);
    invalidateScanCache();
    await rescanTokens();
  };

  const invalidateVirtual = (): void => {
    if (!server) return;
    const seen = new Set<unknown>();
    const ts = Date.now();
    for (const id of [RESOLVED_ID, VIRTUAL_ID]) {
      const mod = server.moduleGraph.getModuleById(id);
      if (mod) {
        // (mod, seen?, timestamp?, isHmr?)
        server.moduleGraph.invalidateModule(mod, seen as Set<never>, ts, true);
      }
    }
  };

  return {
    name: "regexcss",
    enforce: "pre",

    async configResolved(c) {
      root = c.root;
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
      // dev でも build でも load 時は常に最新スキャン
      await rescanTokens();
      const { css } = await generator.generate(tokens);
      for (const source of configSources) this.addWatchFile(source);
      // include で解決した全ファイルを明示的に watch
      // （root 外のファイルは Vite 標準 watcher 範囲外のため必須）
      const files = await resolveFiles(generator.config.content, root);
      for (const file of files) this.addWatchFile(file);
      return css;
    },

    // CSS @import "regexcss"; を実 CSS に inline 展開（Tailwind v4 風）
    // `layer(name)` 構文に対応：CSS 側で指定された name は config.layerName を上書き
    async transform(code, id) {
      if (id === RESOLVED_ID) return null;
      if (!id.endsWith(".css")) return null;
      if (id.includes("/node_modules/")) return null;
      if (!generator) return null;
      if (!CSS_IMPORT_RE.test(code)) return null;
      CSS_IMPORT_RE.lastIndex = 0;

      await rescanTokens();
      for (const source of configSources) this.addWatchFile(source);
      const files = await resolveFiles(generator.config.content, root);
      for (const file of files) this.addWatchFile(file);

      // 同一ファイル内に複数の @import がある場合も layer 別に1度だけ generate
      const blocks = new Map<string | undefined, string>();
      const matches = [...code.matchAll(CSS_IMPORT_RE)];
      CSS_IMPORT_RE.lastIndex = 0;
      for (const m of matches) {
        const key = m[1]?.trim().replace(/^["']|["']$/g, "");
        if (blocks.has(key)) continue;
        const { css } = await generator.generate(tokens, key !== undefined ? { layerName: key } : undefined);
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

    async handleHotUpdate(ctx) {
      if (!generator) return undefined;

      if (configSources.includes(ctx.file)) {
        await buildGenerator();
        invalidateVirtual();
        ctx.server.ws.send({ type: "full-reload" });
        return [];
      }

      const ext = extname(ctx.file);
      if (!CONTENT_EXTENSIONS.has(ext)) return undefined;

      invalidateScanCache();
      invalidateVirtual();
      ctx.server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
