import { dirname, resolve as resolvePath } from "node:path";
import * as vscode from "vscode";
import { findConfigFile } from "./resolve.ts";
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

export const createRegistry = (log: (message: string) => void): Registry => {
  // keyed by absolute config file path; a config shared by sibling folders loads once
  const cache = new Map<string, Promise<RegexcssState | null>>();

  // Which config file governs this document: an explicit `configPath` setting (read
  // per-resource, so a folder's .vscode/settings.json wins), else the nearest
  // regexcss.config.* walking up to the workspace folder root.
  const configFileFor = (uri: vscode.Uri): string | undefined => {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (!folder) return undefined;
    const setting = vscode.workspace.getConfiguration("regexcss", uri).get<string>("configPath");
    if (setting) return resolvePath(folder.uri.fsPath, setting);
    return findConfigFile(dirname(uri.fsPath), folder.uri.fsPath);
  };

  const stateFor = (uri: vscode.Uri): Promise<RegexcssState | null> => {
    const configFile = configFileFor(uri);
    if (!configFile) return Promise.resolve(null);
    let entry = cache.get(configFile);
    if (!entry) {
      entry = loadState(dirname(configFile), configFile)
        .then((state) => {
          log(state ? `loaded ${configFile} — ${state.completions.length} classes` : `no config at ${configFile}`);
          return state;
        })
        .catch((e) => {
          log(`failed to load ${configFile}: ${e instanceof Error ? e.message : String(e)}`);
          return null;
        });
      cache.set(configFile, entry);
    }
    return entry;
  };

  return { stateFor, invalidate: () => cache.clear() };
};
