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

export interface ConvertAndCopyMessage {
  type: 'convert-and-copy';
  target: 'offscreen';
  scrap: unknown; // ZennScrap - using unknown to avoid circular import
}

export interface ClipboardResultMessage {
  type: 'clipboard-result';
  success: boolean;
  error?: string;
}

export type BackgroundMessage = ToastShownMessage | ClipboardResultMessage;

export type OutgoingMessage = ShowToastMessage | ConvertAndCopyMessage;

export function isShowToastMessage(msg: unknown): msg is ShowToastMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ShowToastMessage).type === 'show-toast'
  );
}

export function isConvertAndCopyMessage(
  msg: unknown
): msg is ConvertAndCopyMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ConvertAndCopyMessage).type === 'convert-and-copy' &&
    (msg as ConvertAndCopyMessage).target === 'offscreen'
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
