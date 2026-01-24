# Quickstart: Zenn Scrap Clipper

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (or npm/yarn)
- Chrome/Chromium browser for testing

## Project Setup

```bash
# Clone and enter directory
cd zenn-scrap-clipper

# Install dependencies
pnpm install

# Start development server (with HMR)
pnpm dev
```

## Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder from the project root
5. The extension icon should appear in your toolbar

## Development Workflow

### File Structure

```
src/
├── background.ts    # Service worker - main orchestration
├── content.ts       # Toast notification injection
├── offscreen.ts     # Clipboard operations
├── lib/
│   ├── api.ts       # Zenn API client
│   ├── converter.ts # JSON → Markdown
│   └── markdown.ts  # HTML → Markdown
└── types/
    └── zenn.ts      # API type definitions
```

### Key Commands

```bash
# Development with HMR
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Hot Module Replacement

CRXJS provides HMR for content scripts:
- Edit `content.ts` → Changes apply immediately (no reload)
- Edit `background.ts` → Service worker reloads automatically
- Edit manifest → Full extension reload required

## Testing the Extension

### Manual Testing

1. Navigate to a Zenn scrap: `https://zenn.dev/*/scraps/*`
2. Verify the extension icon is **active** (colored)
3. Click the icon
4. Verify toast shows "コピーしました"
5. Paste into a text editor and verify Markdown format

### Test Scraps

Use these public scraps for testing:
- `https://zenn.dev/zenn/scraps/` (browse Zenn's official scraps)
- Any public scrap page

### Verify Icon States

| Page | Expected Icon State |
|------|---------------------|
| `zenn.dev/user/scraps/xxx` | Active (colored) |
| `zenn.dev/user/articles/xxx` | Inactive (grayed) |
| `zenn.dev/user` | Inactive (grayed) |
| `google.com` | Inactive (grayed) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Background  │    │   Content    │    │  Offscreen   │  │
│  │   Service    │───▶│   Script     │    │   Document   │  │
│  │   Worker     │    │  (toast.ts)  │    │ (clipboard)  │  │
│  └──────┬───────┘    └──────────────┘    └──────▲───────┘  │
│         │                                        │          │
│         │  1. Fetch scrap data                   │          │
│         ▼                                        │          │
│  ┌──────────────┐                               │          │
│  │  Zenn API    │    3. Copy to clipboard ──────┘          │
│  │  /api/scraps │                                           │
│  └──────────────┘                                           │
│         │                                                    │
│         │  2. Convert to Markdown                           │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  Converter   │                                           │
│  │   Library    │                                           │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Common Issues

### Extension icon always grayed out
- Check `chrome://extensions/` for errors
- Verify `declarativeContent` rules are set up correctly
- Check console in service worker for errors

### Clipboard copy fails
- Verify `offscreen.html` is in the build output
- Check that `clipboardWrite` permission is granted
- Look for errors in offscreen document console

### Toast doesn't appear
- Check content script is injected (inspect page, check Sources)
- Verify `scripting` permission in manifest
- Check for CSP errors in console

## Debugging

### Service Worker Logs
1. Go to `chrome://extensions/`
2. Find the extension
3. Click "service worker" link to open DevTools

### Content Script Logs
1. Open DevTools on the target page (F12)
2. Check Console for logs from content script

### Offscreen Document Logs
1. Go to `chrome://extensions/`
2. Click "Inspect views: offscreen.html"

## Build for Production

```bash
# Create optimized build
pnpm build

# Output in dist/ folder
# Ready for Chrome Web Store upload
```

The `dist/` folder contains the complete extension ready for distribution.
