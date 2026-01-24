# Data Model: Zenn Scrap Clipper

**Date**: 2026-01-24
**Branch**: 001-zenn-scrap-clipper

## Overview

This extension processes data from Zenn's API and transforms it into Markdown. No persistent storage is used - all data flows through memory to the clipboard.

## Entity Definitions

### ZennScrapResponse (API Input)

The raw response from `GET https://zenn.dev/api/scraps/{slug}`.

```typescript
interface ZennScrapResponse {
  scrap: ZennScrap;
}

interface ZennScrap {
  id: number;
  slug: string;
  title: string;
  created_at: string;          // ISO 8601: "2025-07-17T13:08:17.943+09:00"
  closed: boolean;
  archived: boolean;
  user: ZennUser;
  topics: ZennTopic[];
  comments: ZennComment[];
}

interface ZennUser {
  id: number;
  username: string;            // URL path identifier
  name: string;                // Display name
  avatar_small_url: string;
}

interface ZennTopic {
  id: number;
  name: string;                // Slug form: "typescript"
  display_name: string;        // Display form: "TypeScript"
  image_url: string;
}

interface ZennComment {
  id: number;
  slug: string;
  body_html: string;           // HTML content
  created_at: string;          // ISO 8601
  pinned: boolean;
  user: ZennUser;
  children: ZennComment[];     // Nested replies (threaded)
}
```

### ScrapData (Normalized Internal)

Normalized structure for conversion processing.

```typescript
interface ScrapData {
  title: string;
  author: string;              // username
  url: string;                 // Full URL: https://zenn.dev/{username}/scraps/{slug}
  createdAt: Date;
  topics: string[];            // Topic display names
  posts: PostData[];           // Flattened comments (depth-first)
}

interface PostData {
  htmlContent: string;
  createdAt: Date;
}
```

### ExportOutput (Markdown Output)

The final Markdown string structure (not a type, conceptual).

```markdown
---
title: "{title}"
author: "{username}"
url: "https://zenn.dev/{username}/scraps/{slug}"
created_at: "YYYY-MM-DD"
topics:
  - {topic1}
  - {topic2}
exported_at: "YYYY-MM-DDTHH:mm:ss+09:00"
---

# {title}

{post1_markdown_content}

---

{post2_markdown_content}

---

{post3_markdown_content}
```

## Data Transformations

### 1. API Response → ScrapData

```
ZennScrapResponse
    ↓ Extract scrap object
    ↓ Build URL from username + slug
    ↓ Flatten nested comments (depth-first traversal)
    ↓ Map topic display_name
ScrapData
```

**Flattening Logic**: Comments with `children` arrays are traversed depth-first to maintain conversational order. Reply hierarchy is not preserved in output (flat list).

### 2. ScrapData → Markdown String

```
ScrapData
    ↓ Generate YAML frontmatter
    ↓ Add title as H1
    ↓ For each post:
    │   ↓ Convert HTML to Markdown
    │   ↓ Normalize Zenn image syntax
    │   ↓ Join with "---" separator
ExportOutput (string)
```

### 3. HTML → Markdown Conversion

| Input | Output |
|-------|--------|
| `<p>text</p>` | `text\n\n` |
| `<strong>text</strong>` | `**text**` |
| `<em>text</em>` | `*text*` |
| `<code>text</code>` | `` `text` `` |
| `<pre><code class="lang">text</code></pre>` | ` ```lang\ntext\n``` ` |
| `<a href="url">text</a>` | `[text](url)` |
| `<img src="url" alt="alt">` | `![alt](url)` |
| `<ul><li>item</li></ul>` | `- item` |
| `<ol><li>item</li></ol>` | `1. item` |
| `<blockquote>text</blockquote>` | `> text` |
| `<h1>`-`<h6>` | `#` - `######` |
| `<br>` | `\n` |
| `<hr>` | `---` |

**Zenn-Specific**:
- Strip image size: `![](url =300x)` → `![](url)`
- Preserve unknown syntax as-is (message boxes, accordions)

## Validation Rules

### Input Validation

| Field | Rule |
|-------|------|
| `scrap.slug` | Required, non-empty string |
| `scrap.title` | Required, non-empty string |
| `scrap.user.username` | Required, non-empty string |
| `scrap.created_at` | Valid ISO 8601 timestamp |
| `scrap.topics` | Array (may be empty) |
| `scrap.comments` | Array (may be empty) |

### Output Validation

| Field | Rule |
|-------|------|
| `title` | Escaped for YAML (quotes if special chars) |
| `author` | Escaped for YAML |
| `url` | Valid HTTPS URL |
| `created_at` | Format: `YYYY-MM-DD` |
| `exported_at` | Format: ISO 8601 with timezone |
| `topics` | Omitted if empty (not empty array) |

## State Transitions

This extension is stateless. No persistent state or lifecycle management required.

**Operation Flow**:
```
[Idle] → (user clicks) → [Fetching] → [Converting] → [Copying] → [Complete/Error] → [Idle]
```

Each operation is independent. No caching, no retry state, no queue.
