# Research: Zenn Scrap Clipper

**Date**: 2026-01-24
**Branch**: 001-zenn-scrap-clipper

## Zenn API Structure

### Decision: Use Zenn's internal API endpoint
**Endpoint**: `GET https://zenn.dev/api/scraps/{slug}`

### Rationale
- Public scraps require NO authentication
- Returns complete scrap data including all comments
- Uses only the slug identifier (extracted from URL path)

### Alternatives Considered
- **DOM scraping**: Rejected - fragile, depends on page structure changes
- **Official export API**: Does not exist for individual scraps

### Key Findings

**API Response Structure**:
```typescript
interface ZennScrapResponse {
  scrap: {
    id: number;
    slug: string;                    // URL identifier
    title: string;                   // Scrap title
    created_at: string;              // ISO 8601 timestamp
    user: {
      username: string;              // Author username
      name: string;                  // Display name
    };
    topics: Array<{
      name: string;                  // Topic slug
      display_name: string;          // Topic display name
    }>;
    comments: Array<{
      id: number;
      body_html: string;             // HTML content (NOT markdown)
      created_at: string;
      children: Comment[];           // Nested replies
    }>;
  };
}
```

**Important Notes**:
1. **Comments are HTML only** - `body_html` field, no raw markdown available
2. **Comments are threaded** - `children` array contains nested replies
3. **Topics may be empty** - Empty array `[]` if no tags assigned
4. **Timestamps use JST** - All include `+09:00` timezone offset
5. **No rate limit headers** observed (uses Cloudflare CDN)

**Error Handling**:
- 404: Returns `{"message":"見つかりませんでした"}`

---

## Chrome Extension Architecture (Manifest V3)

### Decision: Offscreen Document for Clipboard
Service Workers cannot access `navigator.clipboard`. Use Offscreen Documents API.

### Rationale
- Only MV3-compliant solution for clipboard in service worker context
- Single offscreen document can be reused for all copy operations

### Implementation Pattern
```typescript
// Create offscreen document on demand
await chrome.offscreen.createDocument({
  url: 'offscreen.html',
  reasons: [chrome.offscreen.Reason.CLIPBOARD],
  justification: 'Copy text to clipboard'
});

// Send message to offscreen document
chrome.runtime.sendMessage({
  type: 'copy-to-clipboard',
  target: 'offscreen',
  data: markdownText
});
```

---

### Decision: declarativeContent API for Icon State
Use `chrome.declarativeContent` to enable/disable action based on URL.

### Rationale
- Does not require host permissions for URL matching
- More performant than checking URL in every tab update
- Rules persist across sessions

### Implementation Pattern
```typescript
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable(); // Start disabled

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'zenn.dev',
            pathContains: '/scraps/',
            schemes: ['https']
          }
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()]
    }]);
  });
});
```

---

### Decision: Shadow DOM for Toast Notifications
Inject toast using Shadow DOM to isolate styles.

### Rationale
- Prevents CSS conflicts with Zenn's styles
- Ensures consistent appearance
- Page scripts cannot interfere with toast

### Implementation Pattern
```typescript
function showToast(text: string, isError: boolean = false) {
  const container = document.createElement('div');
  const shadow = container.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${isError ? '#dc2626' : '#16a34a'};
        color: white;
        border-radius: 8px;
        z-index: 2147483647;
        font-family: system-ui, sans-serif;
        animation: fadeInOut 2s ease-in-out;
      }
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translateY(20px); }
        10%, 90% { opacity: 1; transform: translateY(0); }
      }
    </style>
    <div class="toast">${text}</div>
  `;

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 2000);
}
```

---

### Decision: documentUrlPatterns for Context Menu
Use `documentUrlPatterns` to show context menu only on scrap pages.

### Rationale
- Built-in URL filtering, no manual checks needed
- Menu items automatically hidden on non-matching pages

### Implementation Pattern
```typescript
chrome.contextMenus.create({
  id: 'copy-markdown',
  title: 'Markdownとしてコピー',
  contexts: ['page'],
  documentUrlPatterns: ['https://zenn.dev/*/scraps/*']
});
```

---

## HTML to Markdown Conversion

### Decision: Simple HTML-to-Markdown converter
Implement lightweight converter for Zenn's HTML output.

### Rationale
- Zenn API returns HTML, not markdown
- Only need to handle subset of HTML tags used in scraps
- External library (turndown) adds unnecessary bundle size

### Tags to Handle
| HTML | Markdown |
|------|----------|
| `<p>` | Paragraph (newlines) |
| `<strong>`, `<b>` | `**text**` |
| `<em>`, `<i>` | `*text*` |
| `<code>` | `` `text` `` |
| `<pre><code>` | Fenced code block |
| `<a href>` | `[text](url)` |
| `<img src>` | `![alt](src)` - strip size params |
| `<ul>`, `<ol>`, `<li>` | List items |
| `<blockquote>` | `> quote` |
| `<h1>`-`<h6>` | `#` headings |
| `<br>` | Newline |
| `<hr>` | `---` |

### Zenn-Specific Syntax
- Image size: `![](url =300x)` → `![](url)` (strip `=\d+x?\d*`)
- Message boxes: Preserve as-is (no standard markdown equivalent)
- Accordions: Preserve as-is

---

## Build Tooling

### Decision: Vite + @crxjs/vite-plugin
Use CRXJS for Chrome extension development.

### Rationale
- HMR support for content scripts
- TypeScript IntelliSense for manifest
- Automatic web_accessible_resources handling
- Standard Vite ecosystem

### Warning
@crxjs/vite-plugin is seeking new maintainers (deadline: March 2025). Monitor for alternatives if project archives.

### Alternatives Considered
- **Webpack**: More complex configuration
- **Rollup**: Lacks HMR, more manual setup
- **Plasmo**: Opinionated, adds unnecessary abstraction

---

## Required Permissions

| Permission | Purpose |
|------------|---------|
| `declarativeContent` | Enable/disable icon based on URL |
| `contextMenus` | Right-click menu |
| `offscreen` | Clipboard access via offscreen document |
| `clipboardWrite` | Write to clipboard |
| `scripting` | Inject toast notification |
| `activeTab` | Access current tab for scripting |

### Host Permissions
- `https://zenn.dev/*` - Fetch scrap API data
