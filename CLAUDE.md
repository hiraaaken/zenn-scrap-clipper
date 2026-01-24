# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 基本ルール

- **日本語でレスポンス**: ユーザーへの応答は日本語で行う
- **TDD**: テストを先に書き、失敗を確認してから実装する
- **ブランチ運用**:
  1. `main`ブランチから作業ブランチを作成（例: `issue-123-fix-bug`）
  2. 作業ブランチで実装
  3. `main`へのPRを作成

## Project Overview

Zenn Scrap Clipper is a Chrome extension (Manifest V3) that converts public Zenn scrap pages to Markdown and copies to clipboard with one click.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Development server with HMR
pnpm build            # Production build to dist/
pnpm test             # Run Vitest unit tests
pnpm typecheck        # TypeScript type checking
pnpm lint             # Run linter
```

## Architecture

Chrome extension with three main components communicating via message passing:

```
Background Service Worker (src/background.ts)
    │
    ├── Fetches scrap data from Zenn API
    ├── Converts to Markdown via lib/converter.ts
    ├── Sends to Offscreen Document for clipboard
    └── Triggers Content Script for toast

Offscreen Document (src/offscreen.ts)
    └── Handles clipboard.writeText() (Service Workers can't access clipboard)

Content Script (src/content.ts)
    └── Injects Shadow DOM toast notification into page
```

**Key constraint**: Service Workers in MV3 cannot access DOM or clipboard APIs, requiring the Offscreen Document pattern.

## Zenn API

```
GET https://zenn.dev/api/scraps/{slug}
```

- Returns HTML in `body_html` field (not Markdown)
- Comments are nested in `children` array
- No authentication required for public scraps

## Extension Loading (Development)

1. Run `pnpm dev`
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Load unpacked → select `dist/` folder

## Debugging

- **Service Worker**: `chrome://extensions/` → click "service worker" link
- **Content Script**: DevTools on target page (F12)
- **Offscreen Document**: `chrome://extensions/` → "Inspect views: offscreen.html"

## Specification Workflow

This project uses speckit commands for feature planning:

- `/speckit.specify` - Create feature specification
- `/speckit.clarify` - Resolve ambiguities in spec
- `/speckit.plan` - Generate implementation plan
- `/speckit.tasks` - Generate task list from plan

Design documents are in `specs/{feature-number}-{feature-name}/`.
