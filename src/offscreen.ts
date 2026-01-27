import { isConvertAndCopyMessage } from './types/messages.ts';
import { generateMarkdown } from './lib/converter.ts';
import type { ZennScrap } from './types/zenn.ts';

console.log('[Offscreen] Script loaded');

/**
 * Write text to clipboard using execCommand fallback.
 * navigator.clipboard.writeText() requires document focus, which offscreen documents don't have.
 * Using document.execCommand('copy') works without focus.
 */
async function writeToClipboard(text: string): Promise<void> {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    if (!success) {
      throw new Error('execCommand copy failed');
    }
    console.log('[Offscreen] execCommand copy succeeded');
  } finally {
    document.body.removeChild(textarea);
  }
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  console.log('[Offscreen] Received message:', message);
  console.log('[Offscreen] isConvertAndCopyMessage:', isConvertAndCopyMessage(message));

  if (isConvertAndCopyMessage(message)) {
    console.log('[Offscreen] Processing convert-and-copy message');
    handleConvertAndCopy(message.scrap as ZennScrap)
      .then((result) => {
        console.log('[Offscreen] Sending response:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('[Offscreen] Error:', error);
        sendResponse({
          type: 'clipboard-result',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
    return true; // Keep the message channel open for async response
  } else {
    console.log('[Offscreen] Message not matched, ignoring');
  }
});

async function handleConvertAndCopy(
  scrap: ZennScrap
): Promise<{ type: 'clipboard-result'; success: boolean; error?: string }> {
  try {
    console.log('[Offscreen] Converting scrap to markdown...');
    const markdown = generateMarkdown(scrap);
    console.log('[Offscreen] Markdown generated, length:', markdown.length);

    console.log('[Offscreen] Writing to clipboard...');
    await writeToClipboard(markdown);
    console.log('[Offscreen] Clipboard write successful');

    return { type: 'clipboard-result', success: true };
  } catch (error) {
    console.error('[Offscreen] Error in handleConvertAndCopy:', error);
    return {
      type: 'clipboard-result',
      success: false,
      error: error instanceof Error ? error.message : 'Conversion or clipboard write failed',
    };
  }
}
