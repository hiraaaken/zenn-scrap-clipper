# Implementation Plan: Zenn Scrap Clipper

**Branch**: `001-zenn-scrap-clipper` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-zenn-scrap-clipper/spec.md`

## Summary

Chrome extension (Manifest V3) that converts public Zenn scrap pages to Markdown with YAML frontmatter and copies to clipboard. Built with TypeScript and Vite using @crxjs/vite-plugin for Chrome extension bundling. Single-click export via toolbar icon or context menu with page-injected toast notifications for feedback.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Vite, @crxjs/vite-plugin
**Storage**: N/A (clipboard only, no persistence)
**Testing**: Vitest (unit tests for converter logic)
**Target Platform**: Chromium-based browsers (Chrome, Edge, Brave, Arc) - Manifest V3
**Project Type**: Browser extension (single project)
**Performance Goals**: Copy operation completes in <3 seconds
**Constraints**: No external server communication, all processing local, minimal permissions
**Scale/Scope**: Single extension, ~5 source files, single user at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is template-only (no specific gates defined). Proceeding with standard best practices:
- [x] Minimal dependencies (only essential build tooling)
- [x] No external data transmission (privacy by design)
- [x] Type-safe implementation (TypeScript)
- [x] Testable components (converter logic isolated)

## Project Structure

### Documentation (this feature)

```text
specs/001-zenn-scrap-clipper/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal message contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── background.ts        # Service Worker (API calls, clipboard, orchestration)
├── content.ts           # Content Script (toast notification injection)
├── lib/
│   ├── api.ts           # Zenn API client (fetch scrap data)
│   ├── converter.ts     # JSON → Markdown conversion logic
│   └── markdown.ts      # Markdown syntax normalization (image syntax)
└── types/
    └── zenn.ts          # Zenn API response type definitions

public/
└── icons/
    ├── icon-16.png      # Toolbar icon (small)
    ├── icon-48.png      # Extension management
    └── icon-128.png     # Chrome Web Store

tests/
├── unit/
│   ├── converter.test.ts
│   └── markdown.test.ts
└── fixtures/
    └── sample-scrap.json

manifest.json            # Chrome extension manifest (Manifest V3)
vite.config.ts           # Vite + CRXJS configuration
tsconfig.json
package.json
```

**Structure Decision**: Single-project Chrome extension structure. Source in `src/` with clear separation between background service worker, content script, and shared library code. Tests focus on converter logic which is pure and easily testable.

## Complexity Tracking

No constitution violations. Design follows minimal complexity:
- Single extension, no multi-project structure
- No state management library (simple message passing)
- No UI framework (plain DOM for toast)
- No database (clipboard only)
