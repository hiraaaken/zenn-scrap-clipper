/**
 * Internal Message Contracts
 *
 * Defines the message types passed between extension components:
 * - Background Service Worker ↔ Content Script
 * - Background Service Worker ↔ Offscreen Document
 *
 * These are internal contracts, not external APIs.
 */

// =============================================================================
// Background ↔ Content Script Messages
// =============================================================================

/**
 * Request from background to content script to show a toast notification.
 */
export interface ShowToastMessage {
  type: 'show-toast';
  text: string;
  isError: boolean;
}

/**
 * Response from content script confirming toast was shown.
 */
export interface ToastShownMessage {
  type: 'toast-shown';
  success: boolean;
}

// =============================================================================
// Background ↔ Offscreen Document Messages
// =============================================================================

/**
 * Request from background to offscreen document to copy text to clipboard.
 */
export interface CopyToClipboardMessage {
  type: 'copy-to-clipboard';
  target: 'offscreen';
  data: string;
}

/**
 * Response from offscreen document with clipboard operation result.
 */
export interface ClipboardResultMessage {
  type: 'clipboard-result';
  success: boolean;
  error?: string;
}

// =============================================================================
// Union Types
// =============================================================================

/**
 * All messages that can be sent to the background service worker.
 */
export type BackgroundMessage =
  | ToastShownMessage
  | ClipboardResultMessage;

/**
 * All messages that can be sent from the background service worker.
 */
export type OutgoingMessage =
  | ShowToastMessage
  | CopyToClipboardMessage;

// =============================================================================
// Message Type Guards
// =============================================================================

export function isShowToastMessage(msg: unknown): msg is ShowToastMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ShowToastMessage).type === 'show-toast'
  );
}

export function isCopyToClipboardMessage(msg: unknown): msg is CopyToClipboardMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as CopyToClipboardMessage).type === 'copy-to-clipboard' &&
    (msg as CopyToClipboardMessage).target === 'offscreen'
  );
}

export function isClipboardResultMessage(msg: unknown): msg is ClipboardResultMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ClipboardResultMessage).type === 'clipboard-result'
  );
}
