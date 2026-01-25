import { fetchScrap, extractSlugFromUrl } from './lib/api.ts';
import { generateMarkdown } from './lib/converter.ts';
import type {
  CopyToClipboardMessage,
  ClipboardResultMessage,
  ShowToastMessage,
} from './types/messages.ts';

// Offscreen document management
let creatingOffscreenDocument: Promise<void> | null = null;

async function setupOffscreenDocument(): Promise<void> {
  const offscreenUrl = chrome.runtime.getURL('src/offscreen.html');

  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  // Avoid race conditions when creating the document
  if (creatingOffscreenDocument) {
    await creatingOffscreenDocument;
    return;
  }

  creatingOffscreenDocument = chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: 'Copy Markdown to clipboard',
  });

  await creatingOffscreenDocument;
  creatingOffscreenDocument = null;
}

async function copyToClipboard(text: string): Promise<ClipboardResultMessage> {
  await setupOffscreenDocument();

  const message: CopyToClipboardMessage = {
    type: 'copy-to-clipboard',
    target: 'offscreen',
    data: text,
  };

  return chrome.runtime.sendMessage(message);
}

async function showToast(tabId: number, text: string, isError: boolean): Promise<void> {
  const message: ShowToastMessage = {
    type: 'show-toast',
    text,
    isError,
  };

  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // Content script might not be loaded, ignore
  }
}

async function handleCopyScrap(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id || !tab.url) {
    return;
  }

  const tabId = tab.id;
  const slug = extractSlugFromUrl(tab.url);

  if (!slug) {
    await showToast(tabId, 'スクラップページではありません', true);
    return;
  }

  const result = await fetchScrap(slug);

  if (!result.success) {
    await showToast(tabId, result.message, true);
    return;
  }

  const markdown = generateMarkdown(result.data.scrap);
  const clipboardResult = await copyToClipboard(markdown);

  if (clipboardResult.success) {
    await showToast(tabId, 'コピーしました', false);
  } else {
    await showToast(tabId, 'コピーに失敗しました', true);
  }
}

// Action click handler
chrome.action.onClicked.addListener((tab) => {
  handleCopyScrap(tab);
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: 'copy-markdown',
    title: 'Markdownとしてコピー',
    contexts: ['page'],
    documentUrlPatterns: ['https://zenn.dev/*/scraps/*'],
  });

  // Setup declarative content rules
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'zenn.dev',
              pathContains: '/scraps/',
              schemes: ['https'],
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy-markdown' && tab) {
    handleCopyScrap(tab);
  }
});
