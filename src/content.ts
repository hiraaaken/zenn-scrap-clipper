import { isShowToastMessage } from './types/messages.ts';

function showToast(text: string, isError: boolean): void {
  // Remove existing toast if present
  const existingToast = document.getElementById('zenn-scrap-clipper-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create container with Shadow DOM
  const container = document.createElement('div');
  container.id = 'zenn-scrap-clipper-toast';
  const shadow = container.attachShadow({ mode: 'closed' });

  const backgroundColor = isError ? '#dc2626' : '#16a34a';

  shadow.innerHTML = `
    <style>
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${backgroundColor};
        color: white;
        border-radius: 8px;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: fadeInOut 2s ease-in-out forwards;
      }
      @keyframes fadeInOut {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        10% {
          opacity: 1;
          transform: translateY(0);
        }
        90% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    </style>
    <div class="toast">${escapeHtml(text)}</div>
  `;

  document.body.appendChild(container);

  // Remove after animation completes
  setTimeout(() => {
    container.remove();
  }, 2000);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (isShowToastMessage(message)) {
    showToast(message.text, message.isError);
    sendResponse({ type: 'toast-shown', success: true });
  }
  return false;
});
