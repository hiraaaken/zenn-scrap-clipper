# Zenn Scrap Clipper

ZennのスクラップページをMarkdownに変換してクリップボードにコピーするChrome拡張機能です。

## 機能概要

- **ワンクリックコピー**: 拡張機能アイコンをクリックするだけでスクラップ全体をMarkdownに変換
- **YAML Frontmatter**: タイトル、著者、URL、作成日、トピックなどのメタデータを含む
- **コンテキストメニュー**: 右クリックメニューから「Markdownとしてコピー」を選択可能
- **視覚的フィードバック**: コピー成功/失敗をToast通知で表示
- **スマートなアイコン状態**: スクラップページでのみアイコンが有効化

### 出力例

```markdown
---
title: TypeScriptの学習メモ
author: username
url: "https://zenn.dev/username/scraps/abc123"
created_at: "2025-07-17"
topics:
  - TypeScript
  - JavaScript
exported_at: "2025-07-17T10:00:00.000Z"
---

# TypeScriptの学習メモ

最初の投稿内容...

---

2番目の投稿内容...
```

## セットアップ

### 必要要件

- Node.js 18+
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動 (HMR対応)
pnpm dev

# プロダクションビルド
pnpm build
```

## 検証方法

### Chrome拡張機能として読み込む

1. `pnpm build` でビルド
2. Chromeで `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `dist/` フォルダを選択

### 動作確認

1. Zennのスクラップページ（例: `https://zenn.dev/*/scraps/*`）にアクセス
2. 拡張機能アイコンがアクティブ（カラー表示）になることを確認
3. アイコンをクリック
4. 「コピーしました」のToast通知が表示されることを確認
5. テキストエディタにペーストしてMarkdown形式を確認

### ユニットテスト

```bash
# テスト実行
pnpm test

# 型チェック
pnpm typecheck
```

## 使用技術

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript 5.x |
| ビルド | Vite + @crxjs/vite-plugin |
| テスト | Vitest + jsdom |
| 拡張機能 | Chrome Manifest V3 |

### アーキテクチャ

```
Background Service Worker
    │
    ├── Zenn API からスクラップデータ取得
    ├── Markdown に変換
    ├── Offscreen Document 経由でクリップボードにコピー
    └── Content Script に Toast 表示を指示

Offscreen Document
    └── clipboard.writeText() を実行 (Service Worker では不可)

Content Script
    └── Shadow DOM で Toast 通知を表示
```

## ファイル構成

```
src/
├── background.ts      # Service Worker (メイン処理)
├── content.ts         # Toast通知
├── offscreen.ts       # クリップボード操作
├── offscreen.html
├── lib/
│   ├── api.ts         # Zenn API クライアント
│   ├── converter.ts   # Markdown生成
│   └── markdown.ts    # HTML→Markdown変換
└── types/
    ├── zenn.ts        # API型定義
    └── messages.ts    # メッセージ型定義

tests/
├── unit/
│   ├── converter.test.ts
│   └── markdown.test.ts
└── fixtures/
    └── sample-scrap.json
```

## ライセンス

MIT
