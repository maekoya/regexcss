# Regexcss

[English](./README.md) | 日本語

> [!WARNING]
> **開発中のため、本番用途での利用はお控えください。** API・プリセット・挙動は予告なく変更されることがあります。

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

## CLI — クラス一覧ドキュメント

`regexcss docs` は、config が定義するすべてのクラスを、それぞれが生成する CSS とともに一覧掲載する自己完結の HTML ページを生成します:

```sh
npx regexcss docs
```

| フラグ                | 説明                                                                            |
| --------------------- | ------------------------------------------------------------------------------- |
| `-c, --config <path>` | config ファイル（デフォルト: `regexcss.config.{ts,mts,js,mjs,cjs}` を自動探索） |
| `-o, --out <path>`    | 出力先 HTML ファイル（デフォルト: `regexcss-docs.html`）                        |
| `--json`              | HTML の代わりにドキュメントデータを JSON として stdout に出力                   |
| `--max-number <n>`    | ルールの正規表現から `\d+` を展開する際の上限（デフォルト: `12`）               |
| `--max-classes <n>`   | 1 ルールあたり docs に載せるクラス数の上限（デフォルト: `100`、`0` = 無制限）   |
| `--title <text>`      | HTML ページのタイトル                                                           |

パターンが有限の場合（リテラル、選択肢、小さな文字クラス、`--max-number` で制限された `\d+`）、クラスは各ルールの正規表現から列挙されます。無限にマッチするパターン、あるいは動的なルールを全クラス列挙せずコンパクトに載せたい場合は、ルールのオプションの第 3 タプル要素として `samples` を付与してください。各サンプルは `{ class, style }` のペアで、docs にそのまま表示されます:

```ts
rules: [
  [
    /^m-(\d+)$/,
    ([, n]) => ({ margin: `${Number(n) / 4}rem` }),
    {
      samples: [{ class: "m-<num>", style: "margin: <num/4>rem;" }],
      label: "margin",
      category: "spacing",
      tags: ["brand"],
    },
  ],
],
```

### プリセットの上限（cap）

数値スケールを持つプリセットルールには、列挙可能に保つための上限が設定されています（`m-9999` のような範囲外のクラスはマッチしなくなります）。上限つきの各プリセットは、値を調整できる factory を提供します:

```ts
import { createSpacingRules, createSizingRules, createZIndexRules } from "regexcss/preset";

rules: [
  ...createSpacingRules({ max: 32 }), // デフォルト 96（margin、padding）
  ...createSizingRules({ max: 64 }),  // デフォルト 96（w、h、min-*、max-*、size）
  ...createZIndexRules({ max: 100 }), // デフォルト 50
],
```

デフォルト値: `spacing` / `gap` / `sizing` → 96、`grid-cols` / `grid-rows` / `row-*` / `order` → 12、`z-index` → 50、`line-clamp` → 6。従来のルール配列（`spacingRules` など）はデフォルト値を使用します。

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
