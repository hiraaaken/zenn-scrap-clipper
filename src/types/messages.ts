/**
 * Internal Message Contracts
 *
 * Defines the message types passed between extension components:
 * - Background Service Worker ↔ Content Script
 * - Background Service Worker ↔ Offscreen Document
 */

export interface ShowToastMessage {
  type: 'show-toast';
  text: string;
  isError: boolean;
}

export interface ToastShownMessage {
  type: 'toast-shown';
  success: boolean;
}

export interface CopyToClipboardMessage {
  type: 'copy-to-clipboard';
  target: 'offscreen';
  data: string;
}

export interface ClipboardResultMessage {
  type: 'clipboard-result';
  success: boolean;
  error?: string;
}

export type BackgroundMessage = ToastShownMessage | ClipboardResultMessage;

export type OutgoingMessage = ShowToastMessage | CopyToClipboardMessage;

export function isShowToastMessage(msg: unknown): msg is ShowToastMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ShowToastMessage).type === 'show-toast'
  );
}

export function isCopyToClipboardMessage(
  msg: unknown
): msg is CopyToClipboardMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as CopyToClipboardMessage).type === 'copy-to-clipboard' &&
    (msg as CopyToClipboardMessage).target === 'offscreen'
  );
}

export function isClipboardResultMessage(
  msg: unknown
): msg is ClipboardResultMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ClipboardResultMessage).type === 'clipboard-result'
  );
}
