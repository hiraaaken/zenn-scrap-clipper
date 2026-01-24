# Feature Specification: Zenn Scrap Clipper

**Feature Branch**: `001-zenn-scrap-clipper`
**Created**: 2026-01-24
**Status**: Draft
**Input**: User description: "Chrome extension to convert Zenn scrap pages to Markdown and copy to clipboard with one click"

## Clarifications

### Session 2026-01-24

- Q: What notification mechanism should be used for success/error feedback? → A: Page-injected toast (overlay in page corner, auto-dismisses)
- Q: How long should toast notifications display before auto-dismissing? → A: 2 seconds
- Q: What language should UI text use? → A: Japanese only (コピーしました, Markdownとしてコピー)

## Overview

A browser extension that enables users to export any public Zenn scrap page to Markdown format with a single click. The extension addresses the lack of per-scrap export functionality on Zenn, where users currently must either export all content at once (with rate limits) or use command-line tools.

### Problem Statement

- Zenn lacks a single-scrap Markdown export feature
- Official bulk export has a 24-hour rate limit
- Existing CLI tools require leaving the browser
- Users want to save work notes and learning logs locally for reuse

### Target Users

- Zenn users who create and collect scraps
- Developers and technical writers who want to preserve knowledge locally
- Anyone browsing public scraps who wants to save content in a portable format

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copy Scrap to Clipboard (Priority: P1)

A user is browsing a public Zenn scrap page and wants to quickly copy the entire content as Markdown to paste into their notes application, knowledge base, or local file.

**Why this priority**: This is the core functionality that delivers the primary value proposition. Without this, the extension has no purpose.

**Independent Test**: Can be fully tested by clicking the extension icon on any public scrap page and verifying Markdown content appears in clipboard.

**Acceptance Scenarios**:

1. **Given** a user is on a public Zenn scrap page (URL matches `https://zenn.dev/*/scraps/*`), **When** they click the extension icon, **Then** the scrap content is converted to Markdown with frontmatter and copied to their clipboard.

2. **Given** a user has copied a scrap, **When** they paste the content, **Then** the output contains YAML frontmatter (title, author, URL, created date, topics, export timestamp) followed by the title as H1 and all posts separated by horizontal rules.

3. **Given** a scrap contains multiple posts/comments, **When** the user exports it, **Then** each post appears in chronological order, separated by `---` dividers.

---

### User Story 2 - Visual Feedback on Action (Priority: P2)

A user clicks the extension and needs immediate confirmation that the copy operation succeeded or failed.

**Why this priority**: User confidence in the tool depends on clear feedback. Without it, users may repeatedly click or not trust the extension.

**Independent Test**: Can be tested by clicking the extension and observing that a success toast appears within 3 seconds.

**Acceptance Scenarios**:

1. **Given** a user clicks the extension icon on a valid scrap page, **When** the copy operation succeeds, **Then** a success notification appears indicating the content was copied.

2. **Given** a user clicks the extension icon, **When** the operation fails (network error, invalid page), **Then** an error notification appears with a user-friendly message explaining what went wrong.

---

### User Story 3 - Context Menu Access (Priority: P2)

A user prefers right-click context menus over toolbar icons for quick actions.

**Why this priority**: Provides an alternative access method for power users who prefer context menus, improving accessibility and workflow flexibility.

**Independent Test**: Can be tested by right-clicking on a scrap page and selecting the copy option from the context menu.

**Acceptance Scenarios**:

1. **Given** a user is on a valid Zenn scrap page, **When** they right-click and select "Copy as Markdown", **Then** the scrap is copied to clipboard with the same formatting as the icon click method.

---

### User Story 4 - Icon State Indication (Priority: P3)

A user browsing Zenn can tell at a glance whether the current page supports the extension's functionality.

**Why this priority**: Prevents user confusion and wasted clicks on non-scrap pages. Improves discoverability of when the extension is applicable.

**Independent Test**: Can be tested by navigating between scrap pages and non-scrap pages and observing icon state changes.

**Acceptance Scenarios**:

1. **Given** a user navigates to a Zenn scrap page, **When** the page loads, **Then** the extension icon appears active/colored in the toolbar.

2. **Given** a user navigates to a non-scrap Zenn page (article, profile, home), **When** the page loads, **Then** the extension icon appears grayed out and is not clickable.

3. **Given** a user navigates to a non-Zenn website, **When** the page loads, **Then** the extension icon appears grayed out.

---

### Edge Cases

- What happens when the scrap has no topics assigned?
  - The topics field is omitted from frontmatter (not an empty array)
- What happens when the scrap contains Zenn-specific image syntax with size specifiers?
  - Size specifiers are stripped, converting `![](url =300x)` to standard `![](url)`
- What happens when network connectivity is lost during export?
  - An error notification is shown: "スクラップの取得に失敗しました"
- What happens when accessing a private or archived scrap?
  - An error notification is shown: "このスクラップは非公開のため取得できません"
- What happens when the scrap has no posts/comments?
  - The Markdown output contains only the frontmatter and title, with no post content
- What happens when a post contains Zenn-specific syntax (message boxes, accordions)?
  - Best-effort conversion to standard Markdown; if not convertible, the original syntax is preserved

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Extension MUST activate only on URLs matching the pattern `https://zenn.dev/*/scraps/*`
- **FR-002**: Extension MUST copy scrap content to clipboard when the user clicks the extension icon
- **FR-003**: Extension MUST provide a right-click context menu option "Markdownとしてコピー" on valid scrap pages
- **FR-004**: Extension MUST generate Markdown output with YAML frontmatter containing: title, author, url, created_at, topics (if present), and exported_at
- **FR-005**: Extension MUST display the scrap title as an H1 heading after the frontmatter
- **FR-006**: Extension MUST separate each post/comment with a horizontal rule (`---`)
- **FR-007**: Extension MUST display a success notification as a page-injected toast overlay when copy completes (auto-dismisses after 2 seconds)
- **FR-008**: Extension MUST display an error notification as a page-injected toast overlay with a descriptive message when operations fail (auto-dismisses after 2 seconds)
- **FR-009**: Extension MUST show the icon in an inactive/grayed state on non-scrap pages
- **FR-010**: Extension MUST convert Zenn image syntax with size specifiers to standard Markdown image syntax
- **FR-011**: Extension MUST preserve standard Markdown syntax (code blocks, links, lists) without modification
- **FR-012**: Extension MUST format the `created_at` date as `YYYY-MM-DD`
- **FR-013**: Extension MUST format the `exported_at` timestamp in ISO 8601 format with timezone
- **FR-014**: Extension MUST NOT send any user data to external servers (privacy requirement)
- **FR-015**: Extension MUST work in Chromium-based browsers (Chrome, Edge, Brave, Arc)
- **FR-016**: Extension MUST display all user-facing text in Japanese

### Key Entities

- **Scrap**: A collection of posts/notes on Zenn with a title, author, creation date, and optional topics
- **Post/Comment**: An individual entry within a scrap containing Markdown content
- **Topic**: A tag/category associated with a scrap
- **Frontmatter**: YAML metadata block at the start of the exported Markdown
- **Export Output**: The complete Markdown document including frontmatter and formatted content

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can copy a scrap to clipboard in under 3 seconds from clicking the extension icon
- **SC-002**: 100% of copied content pastes as valid Markdown that renders correctly in standard Markdown viewers
- **SC-003**: Extension correctly identifies and activates on 100% of valid Zenn scrap page URLs
- **SC-004**: Extension correctly stays inactive on 100% of non-scrap Zenn pages
- **SC-005**: Users receive visual feedback (success or error notification) within 3 seconds of clicking
- **SC-006**: Zero user data is transmitted to external servers (excluding the target Zenn page data retrieval)
- **SC-007**: Extension functions correctly across all major Chromium-based browsers

## Scope Boundaries

### In Scope (v1.0)
- Public Zenn scrap pages only
- Clipboard copy functionality
- Markdown conversion with frontmatter
- Visual feedback (notifications)
- Icon state management
- Context menu support

### Out of Scope (v1.0)
- Authenticated/private scraps (requires login)
- Archived scraps
- Zenn articles or books
- Direct file download
- Image downloading/embedding
- Custom output templates
- Batch export of multiple scraps

## Assumptions

- Zenn's public scrap pages are accessible without authentication
- Zenn provides a stable method to retrieve scrap content
- Users have a Chromium-based browser installed
- Clipboard access is available in the browser environment
- Notification permissions are available or can be requested
- The scrap content is primarily in Markdown-compatible format
