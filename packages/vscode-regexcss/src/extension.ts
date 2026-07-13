import * as vscode from "vscode";
import { createCompletionProvider } from "./completion.ts";
import { createHoverProvider } from "./hover.ts";
import { createRegistry } from "./registry.ts";

// Where class names appear. Completion triggers only inside class attributes (see
// tokens.ts); hover works in any of these documents. The `regexcss.languages` setting
// replaces this list wholesale (its package.json default mirrors these values).
const DEFAULT_LANGUAGES = [
  "html",
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "vue",
  "svelte",
  "astro",
];

const DEFAULT_ATTRIBUTES = ["class", "className", "class:list", "classList"];

/** The languages to register providers for — the `regexcss.languages` setting, or the built-in defaults. */
const resolveLanguages = (): string[] => {
  const configured = vscode.workspace.getConfiguration("regexcss").get<string[]>("languages");
  return configured && configured.length > 0 ? [...new Set(configured)] : DEFAULT_LANGUAGES;
};

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

  // Providers are (re)registered for the configured languages; holding their
  // disposables lets us swap them when `additionalLanguages` changes, no reload needed.
  let providers: vscode.Disposable[] = [];
  const registerProviders = (): void => {
    for (const d of providers) d.dispose();
    const languages = resolveLanguages();
    providers = [
      vscode.languages.registerHoverProvider(languages, createHoverProvider(stateFor)),
      vscode.languages.registerCompletionItemProvider(
        languages,
        createCompletionProvider(stateFor, getAttributes),
        '"',
        "'",
        "`",
        " ",
      ),
    ];
    output.appendLine(`providers active for: ${languages.join(", ")}`);
  };
  registerProviders();
  context.subscriptions.push({ dispose: () => providers.forEach((d) => d.dispose()) });

  // reload when any config file changes / is created / deleted
  const watcher = vscode.workspace.createFileSystemWatcher("**/regexcss.config.{ts,mts,js,mjs,cjs}");
  const invalidate = (): void => registry.invalidate();
  watcher.onDidChange(invalidate);
  watcher.onDidCreate(invalidate);
  watcher.onDidDelete(invalidate);
  context.subscriptions.push(watcher);

  // adding/removing workspace folders changes which configs are discoverable
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(invalidate));

  // react to setting changes: drop cached configs, and re-register providers when the
  // language list changed.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration("regexcss")) return;
      registry.invalidate();
      if (e.affectsConfiguration("regexcss.languages")) registerProviders();
    }),
  );
}

export function deactivate(): void {}
