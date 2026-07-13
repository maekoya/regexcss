import * as vscode from "vscode";
import { createCompletionProvider } from "./completion.ts";
import { createHoverProvider } from "./hover.ts";
import { createRegistry } from "./registry.ts";

const DEFAULT_ATTRIBUTES = ["class", "className", "class:list", "classList"];

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("regexcss");
  context.subscriptions.push(output);

  // One state per config, loaded lazily per document — supports many
  // regexcss.config.* across a monorepo (the config whose content.include
  // matches the document wins).
  const registry = createRegistry((m) => output.appendLine(m));
  const stateFor = (uri: vscode.Uri) => registry.stateFor(uri);
  const getAttributes = (uri: vscode.Uri): string[] =>
    vscode.workspace.getConfiguration("regexcss", uri).get<string[]>("classAttributes") ?? DEFAULT_ATTRIBUTES;

  // Providers register for every file:// document; the content.include gate
  // (registry.stateFor) does the per-document filtering, so a config that includes
  // .php or .md files gets IntelliSense with no language list to maintain. "file"
  // scheme only: stateFor needs a real fsPath and a workspace folder, so output
  // panes, git diffs and untitled documents never match anyway.
  const selector: vscode.DocumentSelector = { scheme: "file" };
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, createHoverProvider(stateFor)),
    vscode.languages.registerCompletionItemProvider(
      selector,
      createCompletionProvider(stateFor, getAttributes),
      '"',
      "'",
      "`",
      " ",
    ),
  );

  // reload when any config file changes / is created / deleted
  const watcher = vscode.workspace.createFileSystemWatcher("**/regexcss.config.{ts,mts,js,mjs,cjs}");
  const invalidate = (): void => registry.invalidate();
  watcher.onDidChange(invalidate);
  watcher.onDidCreate(invalidate);
  watcher.onDidDelete(invalidate);
  context.subscriptions.push(watcher);

  // adding/removing workspace folders changes which configs are discoverable
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(invalidate));

  // react to setting changes (configPath) by dropping cached configs
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("regexcss")) registry.invalidate();
    }),
  );
}

export function deactivate(): void {}
