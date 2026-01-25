import { isCopyToClipboardMessage } from './types/messages.ts';

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (isCopyToClipboardMessage(message)) {
    handleClipboardCopy(message.data)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          type: 'clipboard-result',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    return true; // Keep the message channel open for async response
  }
});

async function handleClipboardCopy(
  text: string
): Promise<{ type: 'clipboard-result'; success: boolean; error?: string }> {
  try {
    await navigator.clipboard.writeText(text);
    return { type: 'clipboard-result', success: true };
  } catch (error) {
    return {
      type: 'clipboard-result',
      success: false,
      error: error instanceof Error ? error.message : 'Clipboard write failed',
    };
  }
}
