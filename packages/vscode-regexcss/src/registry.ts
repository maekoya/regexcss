import { dirname, resolve as resolvePath } from "node:path";
import * as vscode from "vscode";
import { orderConfigCandidates } from "./content.ts";
import { loadState, type RegexcssState } from "./state.ts";

/**
 * Resolves and caches one {@link RegexcssState} per config file. Configs load lazily
 * — the first hover/completion in a package pays a one-time load, then it's cached —
 * so a monorepo with many `regexcss.config.ts` only loads the configs you actually
 * edit against.
 */
export interface Registry {
  /** The state governing `uri`, loading (and caching) its config on first use. */
  stateFor(uri: vscode.Uri): Promise<RegexcssState | null>;
  /** Drop all cached configs; the next use reloads. Call when a config/setting changes. */
  invalidate(): void;
}

const CONFIG_GLOB = "**/regexcss.config.{ts,mts,js,mjs,cjs}";

export const createRegistry = (log: (message: string) => void): Registry => {
  // keyed by absolute config file path; a config shared by sibling folders loads once
  const stateCache = new Map<string, Promise<RegexcssState | null>>();
  // every regexcss.config.* in the workspace, found once and reused
  let configListPromise: Promise<string[]> | undefined;

  const workspaceConfigFiles = (): Promise<string[]> => {
    // the explicit exclude replaces VSCode's default excludes, so a config hidden by a
    // user's files.exclude is still found
    configListPromise ??= Promise.resolve(vscode.workspace.findFiles(CONFIG_GLOB, "**/node_modules/**")).then((uris) =>
      uris.map((u) => u.fsPath).sort(),
    );
    return configListPromise;
  };

  const loadCached = (configFile: string): Promise<RegexcssState | null> => {
    let entry = stateCache.get(configFile);
    if (!entry) {
      entry = loadState(dirname(configFile), configFile)
        .then((state) => {
          if (state?.matches === null) {
            log(`${configFile}: content.include is empty — dormant (add include globs to enable IntelliSense)`);
          } else {
            log(state ? `loaded ${configFile} — ${state.completions.length} classes` : `no config at ${configFile}`);
          }
          return state;
        })
        .catch((e) => {
          log(`failed to load ${configFile}: ${e instanceof Error ? e.message : String(e)}`);
          return null;
        });
      stateCache.set(configFile, entry);
    }
    return entry;
  };

  // Which config governs this document: the one whose content.include globs match it.
  // Candidates are an explicit `configPath` setting (read per-resource, so a folder's
  // .vscode/settings.json wins), else every config in the workspace ordered by
  // proximity — include patterns may reach above their config dir (`../shared/**`),
  // so a plain walk-up from the document would miss such configs.
  const stateFor = async (uri: vscode.Uri): Promise<RegexcssState | null> => {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (!folder) return null; // outside any workspace folder → dormant
    const setting = vscode.workspace.getConfiguration("regexcss", uri).get<string>("configPath");
    const candidates = setting
      ? [resolvePath(folder.uri.fsPath, setting)]
      : orderConfigCandidates(await workspaceConfigFiles(), uri.fsPath);
    for (const configFile of candidates) {
      const state = await loadCached(configFile);
      if (state?.matches?.(uri.fsPath)) return state;
    }
    return null;
  };

  return {
    stateFor,
    invalidate: () => {
      stateCache.clear();
      configListPromise = undefined; // re-find configs next use (picks up created/deleted files)
    },
  };
};
