// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type CopyToClipboard = (text: string) => Promise<void>;

type SavedSelection = {
  ranges: Array<{ start: Node; end: Node; startOffset: number; endOffset: number }>;
};

function createRange(
  start: Node,
  startOffset: number,
  end: Node,
  endOffset: number
): Range {
  const range = {
    startContainer: start,
    startOffset,
    endContainer: end,
    endOffset,
    cloneRange: () => createRange(start, startOffset, end, endOffset),
  } as Range;
  return range;
}

function installDomHarness() {
  const textNodes: Text[] = [];
  const makeText = (data: string) => {
    const node = { data, isConnected: true } as Text;
    textNodes.push(node);
    return node;
  };

  let bodyChildren: HTMLElement[] = [];
  const body = {
    appendChild: (el: HTMLElement) => {
      bodyChildren.push(el);
      return el;
    },
    removeChild: (el: HTMLElement) => {
      bodyChildren = bodyChildren.filter((child) => child !== el);
    },
  };

  const selection: SavedSelection & {
    rangeCount: number;
    removeAllRanges: () => void;
    addRange: (range: Range) => void;
    getRangeAt: (index: number) => Range;
  } = {
    ranges: [],
    rangeCount: 0,
    removeAllRanges: () => {
      selection.ranges = [];
      selection.rangeCount = 0;
    },
    addRange: (range: Range) => {
      selection.ranges.push({
        start: range.startContainer,
        end: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      });
      selection.rangeCount = selection.ranges.length;
    },
    getRangeAt: (index: number) => {
      const saved = selection.ranges[index];
      return createRange(saved.start, saved.startOffset, saved.end, saved.endOffset);
    },
  };

  const scrollTo = vi.fn();
  let scrollX = 120;
  let scrollY = 45;

  const textareaProto = {
    value: '',
    tabIndex: 0,
    className: '',
    select: vi.fn(),
    setSelectionRange: vi.fn(),
    remove: vi.fn(),
    setAttribute: vi.fn(),
  };

  let createdTextarea: (typeof textareaProto & HTMLElement) | null = null;

  const createElement = vi.fn((tag: string) => {
    if (tag !== 'textarea') {
      throw new Error(`unexpected tag ${tag}`);
    }
    createdTextarea = {
      ...textareaProto,
      remove: vi.fn(() => {
        bodyChildren = bodyChildren.filter((child) => child !== createdTextarea);
        if (createdTextarea) {
          (createdTextarea as { isConnected: boolean }).isConnected = false;
        }
      }),
    } as typeof textareaProto & HTMLElement;
    bodyChildren.push(createdTextarea);
    return createdTextarea;
  });

  const execCommand = vi.fn(() => true);

  const doc = {
    activeElement: null as HTMLElement | null,
    body,
    createElement,
    getSelection: () => selection,
    execCommand,
  };

  const focusTarget = {
    focus: vi.fn(() => {
      doc.activeElement = focusTarget as unknown as HTMLElement;
    }),
  };

  doc.activeElement = focusTarget as unknown as HTMLElement;

  vi.stubGlobal('document', doc);
  (globalThis as unknown as { document: typeof doc }).document = doc;
  vi.stubGlobal('window', {
    get scrollX() {
      return scrollX;
    },
    get scrollY() {
      return scrollY;
    },
    scrollTo: (x: number, y: number) => {
      scrollX = x;
      scrollY = y;
      scrollTo(x, y);
    },
    setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
    clearTimeout: (...args: Parameters<typeof clearTimeout>) => clearTimeout(...args),
  });

  selection.addRange(createRange(makeText('hello'), 0, makeText('world'), 5));

  return {
    bodyChildren: () => bodyChildren,
    createdTextarea: () => createdTextarea,
    execCommand,
    focusTarget,
    scrollTo,
    getScroll: () => ({ scrollX, scrollY }),
    selection,
    setActiveElement: (el: HTMLElement | null) => {
      doc.activeElement = el;
    },
    setClipboard: (impl?: { writeText?: (text: string) => Promise<void> }) => {
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        configurable: true,
        value: impl,
      });
    },
    removeClipboard: () => {
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      });
    },
  };
}

describe('copyToClipboard', () => {
  let harness: ReturnType<typeof installDomHarness>;
  let copyToClipboard: CopyToClipboard;

  beforeEach(async () => {
    harness = installDomHarness();
    ({ copyToClipboard } = await import('../copyToClipboard'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses the clipboard API when writeText succeeds and does not call legacy copy', async () => {
    const writeText = vi.fn(async () => undefined);
    harness.setClipboard({ writeText });

    await copyToClipboard('payload');

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('payload');
    expect(harness.execCommand).not.toHaveBeenCalled();
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('falls back when the clipboard API is missing and legacy copy succeeds', async () => {
    harness.removeClipboard();

    await copyToClipboard('legacy payload');

    expect(harness.execCommand).toHaveBeenCalledOnce();
    expect(harness.execCommand).toHaveBeenCalledWith('copy');
    expect(harness.createdTextarea()?.value).toBe('legacy payload');
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('falls back when writeText rejects and legacy copy succeeds', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('denied');
    });
    harness.setClipboard({ writeText });

    await copyToClipboard('after reject');

    expect(writeText).toHaveBeenCalledOnce();
    expect(harness.execCommand).toHaveBeenCalledOnce();
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('rejects when execCommand returns false', async () => {
    harness.removeClipboard();
    harness.execCommand.mockReturnValue(false);

    await expect(copyToClipboard('fail false')).rejects.toThrow();
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('rejects when execCommand throws', async () => {
    harness.removeClipboard();
    harness.execCommand.mockImplementation(() => {
      throw new Error('exec boom');
    });

    await expect(copyToClipboard('fail throw')).rejects.toThrow();
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('rejects with only an error toast path when both mechanisms fail', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('api fail');
    });
    harness.setClipboard({ writeText });
    harness.execCommand.mockReturnValue(false);

    await expect(copyToClipboard('both fail')).rejects.toThrow();
    expect(writeText).toHaveBeenCalledOnce();
    expect(harness.execCommand).toHaveBeenCalledOnce();
  });

  it('restores focus, connected selection ranges, scroll position, and removes the textarea', async () => {
    harness.removeClipboard();
    const disconnected = { isConnected: false } as Node;
    harness.selection.ranges.push({
      start: disconnected,
      end: disconnected,
      startOffset: 0,
      endOffset: 1,
    });
    harness.selection.rangeCount = harness.selection.ranges.length;

    await copyToClipboard('restore me');

    expect(harness.focusTarget.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(harness.getScroll()).toEqual({ scrollX: 120, scrollY: 45 });
    expect(harness.scrollTo).toHaveBeenCalledWith(120, 45);
    expect(harness.selection.ranges).toHaveLength(1);
    expect(harness.bodyChildren()).toHaveLength(0);
  });

  it('selects the full legacy textarea value before execCommand', async () => {
    harness.removeClipboard();

    await copyToClipboard('select-all');

    const textarea = harness.createdTextarea();
    expect(textarea?.select).toHaveBeenCalled();
    expect(textarea?.setSelectionRange).toHaveBeenCalledWith(0, 'select-all'.length);
  });
});
