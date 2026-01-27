import { fetchScrap, extractSlugFromUrl } from './lib/api.ts';
import type {
  ConvertAndCopyMessage,
  ClipboardResultMessage,
  ShowToastMessage,
} from './types/messages.ts';
import type { ZennScrap } from './types/zenn.ts';

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
    justification: 'Convert scrap to Markdown and copy to clipboard',
  });

  await creatingOffscreenDocument;
  creatingOffscreenDocument = null;
}

async function convertAndCopy(scrap: ZennScrap): Promise<ClipboardResultMessage> {
  console.log('[Background] Setting up offscreen document...');
  await setupOffscreenDocument();
  console.log('[Background] Offscreen document ready');

  const message: ConvertAndCopyMessage = {
    type: 'convert-and-copy',
    target: 'offscreen',
    scrap,
  };

  console.log('[Background] Sending message to offscreen:', message.type);
  const result = await chrome.runtime.sendMessage(message);
  console.log('[Background] Received response from offscreen:', result);
  return result;
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

  const clipboardResult = await convertAndCopy(result.data.scrap);

  if (clipboardResult.success) {
    await showToast(tabId, 'コピーしました', false);
  } else {
    await showToast(tabId, 'コピーに失敗しました', true);
  }
}

// Action click handler
chrome.action.onClicked.addListener((tab) => {
  (async () => {
    try {
      await handleCopyScrap(tab);
    } catch (error) {
      console.error('Failed to handle copy scrap:', error);
      if (tab.id) {
        await showToast(tab.id, '予期しないエラーが発生しました', true);
      }
    }
  })();
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
    (async () => {
      try {
        await handleCopyScrap(tab);
      } catch (error) {
        console.error('Failed to handle copy scrap from context menu:', error);
        if (tab.id) {
          await showToast(tab.id, '予期しないエラーが発生しました', true);
        }
      }
    })();
  }
});
