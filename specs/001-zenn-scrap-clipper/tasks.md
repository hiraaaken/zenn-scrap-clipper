# Tasks: Zenn Scrap Clipper

**Input**: Design documents from `/specs/001-zenn-scrap-clipper/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests for converter logic only (Vitest). No TDD approach requested.

**Organization**: Tasks grouped by user story to enable independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and Chrome extension structure

- [X] T001 Initialize pnpm project with package.json (name: zenn-scrap-clipper, type: module)
- [X] T002 Install dependencies: typescript, vite, @crxjs/vite-plugin, @types/chrome
- [X] T003 [P] Create tsconfig.json with strict mode and ES2020 target
- [X] T004 [P] Create vite.config.ts with CRXJS plugin configuration
- [X] T005 [P] Create manifest.json with Manifest V3 configuration (permissions: declarativeContent, contextMenus, offscreen, clipboardWrite, scripting, activeTab; host_permissions: https://zenn.dev/*)
- [X] T006 [P] Create placeholder icons in public/icons/ (icon-16.png, icon-48.png, icon-128.png)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create Zenn API types in src/types/zenn.ts (ZennScrapResponse, ZennScrap, ZennComment, ZennTopic, ZennUser)
- [X] T008 [P] Create internal message types in src/types/messages.ts (ShowToastMessage, CopyToClipboardMessage, ClipboardResultMessage)
- [X] T009 Implement Zenn API client in src/lib/api.ts (fetchScrap function with error handling)
- [X] T010 [P] Implement HTML-to-Markdown converter in src/lib/markdown.ts (convertHtmlToMarkdown, stripImageSize)
- [X] T011 Implement scrap-to-Markdown converter in src/lib/converter.ts (generateMarkdown with frontmatter)
- [X] T012 Create offscreen.html for clipboard operations in src/offscreen.html
- [X] T013 Implement offscreen script in src/offscreen.ts (clipboard write handler)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Copy Scrap to Clipboard (Priority: P1) 🎯 MVP

**Goal**: Click extension icon → Markdown copied to clipboard

**Independent Test**: Click icon on any public scrap page, paste into editor, verify valid Markdown with frontmatter

### Implementation for User Story 1

- [X] T014 [US1] Create background service worker skeleton in src/background.ts (chrome.action.onClicked listener)
- [X] T015 [US1] Implement URL parsing to extract slug from current tab URL in src/background.ts
- [X] T016 [US1] Implement main copy flow in src/background.ts: fetch → convert → copy via offscreen
- [X] T017 [US1] Implement offscreen document creation/reuse in src/background.ts (setupOffscreenDocument)
- [X] T018 [US1] Wire clipboard result handling in src/background.ts

**Checkpoint**: User Story 1 complete - can copy scrap to clipboard via icon click

---

## Phase 4: User Story 2 - Visual Feedback (Priority: P2)

**Goal**: Show toast notification after copy (success/error)

**Independent Test**: Click icon, observe toast appears in bottom-right corner for 2 seconds

### Implementation for User Story 2

- [X] T019 [US2] Create content script in src/content.ts with toast injection function (showToast)
- [X] T020 [US2] Implement Shadow DOM toast with CSS animation in src/content.ts
- [X] T021 [US2] Add message listener in src/content.ts for show-toast messages
- [X] T022 [US2] Update background.ts to send show-toast message after copy success
- [X] T023 [US2] Update background.ts to send show-toast message with error on failure
- [X] T024 [US2] Register content script in manifest.json for zenn.dev/*/scraps/*

**Checkpoint**: User Story 2 complete - toast feedback working

---

## Phase 5: User Story 3 - Context Menu Access (Priority: P2)

**Goal**: Right-click menu option "Markdownとしてコピー" triggers same copy flow

**Independent Test**: Right-click on scrap page, select menu item, verify copy works same as icon

### Implementation for User Story 3

- [X] T025 [US3] Add context menu creation in src/background.ts onInstalled listener
- [X] T026 [US3] Add contextMenus.onClicked listener in src/background.ts
- [X] T027 [US3] Extract shared copy logic into reusable function in src/background.ts (handleCopyScrap)

**Checkpoint**: User Story 3 complete - context menu working

---

## Phase 6: User Story 4 - Icon State Indication (Priority: P3)

**Goal**: Extension icon enabled only on scrap pages, grayed out elsewhere

**Independent Test**: Navigate between scrap/non-scrap pages, observe icon state changes

### Implementation for User Story 4

- [X] T028 [US4] Add declarativeContent rules in src/background.ts onInstalled listener
- [X] T029 [US4] Call chrome.action.disable() by default in src/background.ts
- [X] T030 [US4] Configure PageStateMatcher for zenn.dev/*/scraps/* pattern

**Checkpoint**: User Story 4 complete - icon state indication working

---

## Phase 7: Polish & Testing

**Purpose**: Unit tests for converter logic and final cleanup

- [X] T031 [P] Install vitest as dev dependency
- [X] T032 [P] Create test fixture in tests/fixtures/sample-scrap.json
- [X] T033 [P] Write unit tests for markdown.ts in tests/unit/markdown.test.ts
- [X] T034 [P] Write unit tests for converter.ts in tests/unit/converter.test.ts
- [X] T035 Add test script to package.json
- [ ] T036 Validate extension loads in Chrome without errors
- [ ] T037 Manual E2E test: full flow on real Zenn scrap page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3-6 (User Stories)**: All depend on Phase 2 completion
- **Phase 7 (Polish)**: After all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 - No dependencies on other stories
- **US2 (P2)**: After Phase 2 - Integrates with US1 (sends toast after copy)
- **US3 (P2)**: After Phase 2 - Reuses US1 copy logic
- **US4 (P3)**: After Phase 2 - Independent (icon state only)

### Parallel Opportunities

Setup phase:
```
T003, T004, T005, T006 can run in parallel
```

Foundational phase:
```
T008, T010 can run in parallel (after T007)
T012, T013 can run in parallel
```

Polish phase:
```
T031, T032, T033, T034 can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test icon click → clipboard copy
5. Extension is usable at this point!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Core copy works (MVP!)
3. Add US2 → Visual feedback added
4. Add US3 → Context menu added
5. Add US4 → Polish icon states
6. Tests + Cleanup → Production ready

---

## Notes

- All user-facing text in Japanese (コピーしました, スクラップの取得に失敗しました, etc.)
- Toast auto-dismisses after 2 seconds
- No popup needed - action triggers immediately on click
- Offscreen document required for clipboard in MV3 service worker
