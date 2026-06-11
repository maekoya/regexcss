# Regexcss

[English](./README.md) | 日本語

ユーザー定義の正規表現ルールで動く、ゼロプリセットの CSS ユーティリティエンジン。

regexcss はソースファイル中のクラス名から atomic CSS を生成します。**デフォルトのルールは一切持ちません** — すべてのユーティリティは、正規表現と CSS を生成する関数のペアとして、あなた自身が定義します。

## 特徴

- **ゼロプリセット** — ルールを定義しない限り、何も生成されない
- **正規表現ルール** — ``[/^m-(\d+)$/, ([, n]) => ({ margin: `${n}px` })]`` これだけで完成
- **バリアント** — `hover:` や `md:` など、メディアクエリ / セレクタ変換つきで自由に定義可能
- **Vite プラグイン** — コンテンツをスキャンし、生成した CSS を仮想モジュールとして配信
- **オプトインのプリセット** — Tailwind 風のルールセット（`spacing`、`layout`、`typography` など）を、必要なときだけ展開して利用可能

## インストール

```sh
npm install -D regexcss
```

> [!NOTE]
> **Node.js 20 以降**が必要です。Vite プラグインを使う場合は **Vite 8 以降**が必要です（optional peer dependency として宣言されています）。

## クイックスタート

**1. Vite プラグインを追加**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import regexcss from "regexcss/vite";

export default defineConfig({
  plugins: [regexcss()],
});
```

**2. ルールを定義**

```ts
// regexcss.config.ts
import { defineConfig } from "regexcss";
import { createVariant } from "regexcss/helpers";

export default defineConfig({
  content: {
    include: ["./index.html", "./src/**/*.{ts,tsx}"],
  },
  rules: [
    [/^m-(\d+)$/, ([, n]) => ({ margin: `${Number(n) / 4}rem` })],
    [/^text-(left|center|right)$/, ([, align]) => ({ "text-align": align })],
  ],
  variants: [
    createVariant("hover", { selector: ":hover" }),
    createVariant("md", { parent: "@media (min-width: 768px)" }),
  ],
});
```

**3. 生成された CSS をインポート**

```css
/* main.css */
@import "regexcss" layer(utilities);
```

これでコンテンツ中の `class="m-4 hover:text-center"` から、あなたが定義したとおりの CSS だけが生成されます。

## エントリーポイント

| インポート         | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `regexcss`         | `defineConfig`、`createGenerator`、型定義                                   |
| `regexcss/vite`    | Vite プラグイン                                                             |
| `regexcss/helpers` | `createVariant`、単位ヘルパー（`rem`、`px` など）、`@custom-media` パーサー |
| `regexcss/preset`  | オプションの Tailwind 風ルールセット（`spacingRules`、`layoutRules` など）  |

## サンプル

プリセット・カスタムルール・バリアントを組み合わせた動作例は [`examples/basic-vite`](./examples/basic-vite) を参照してください。

## ライセンス

MIT © 2026 maekoya
