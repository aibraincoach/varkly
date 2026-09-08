const LEGACY_TEXTAREA_CLASS =
  'fixed -left-[9999px] top-0 w-px h-px opacity-0 pointer-events-none';

async function tryClipboardApi(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function getActiveHTMLElement(): HTMLElement | null {
  const activeElement = document.activeElement;
  if (!activeElement || typeof (activeElement as HTMLElement).focus !== 'function') {
    return null;
  }
  return activeElement as HTMLElement;
}

function copyWithLegacyTextarea(text: string): void {
  const activeElement = getActiveHTMLElement();
  const selection = document.getSelection();
  const savedRanges: Range[] = [];

  if (selection) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      savedRanges.push(selection.getRangeAt(index).cloneRange());
    }
  }

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.tabIndex = -1;
  textarea.className = LEGACY_TEXTAREA_CLASS;

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    const copied = document.execCommand('copy');
    if (!copied) {
      throw new Error('execCommand copy returned false');
    }
  } finally {
    textarea.remove();

    if (activeElement) {
      activeElement.focus({ preventScroll: true });
    }

    window.scrollTo(scrollX, scrollY);

    if (selection) {
      selection.removeAllRanges();
      for (const range of savedRanges) {
        if (range.startContainer.isConnected && range.endContainer.isConnected) {
          selection.addRange(range);
        }
      }
    }
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  if (await tryClipboardApi(text)) {
    return;
  }

  try {
    copyWithLegacyTextarea(text);
  } catch {
    throw new Error('Could not copy to clipboard');
  }
}
