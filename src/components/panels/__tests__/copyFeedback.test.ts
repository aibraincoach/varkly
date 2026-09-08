import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COPY_FEEDBACK_DURATION_MS,
  createCopyFeedbackController,
} from '../copyFeedback';

describe('createCopyFeedbackController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', {
      setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
      clearTimeout: (...args: Parameters<typeof clearTimeout>) => clearTimeout(...args),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows feedback for exactly 2000ms on the latest success', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError });
    const copy = vi.fn(async () => undefined);

    await controller.copy('link', 'url', 'Link copied', copy);

    expect(controller.getCopiedKey()).toBe('link');
    expect(onSuccess).toHaveBeenCalledWith('link', 'Link copied');

    vi.advanceTimersByTime(COPY_FEEDBACK_DURATION_MS - 1);
    expect(controller.getCopiedKey()).toBe('link');

    vi.advanceTimersByTime(1);
    expect(controller.getCopiedKey()).toBe('');
  });

  it('clears prior label and timeout when a newer attempt starts', async () => {
    const onSuccess = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError: vi.fn() });

    let resolveFirst: (() => void) | undefined;
    const first = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    const second = vi.fn(async () => undefined);

    const firstPromise = controller.copy('sys', 'one', 'System prompt copied', () => first);
    await controller.copy('conv', 'two', 'Conversation prompt copied', second);

    expect(controller.getCopiedKey()).toBe('conv');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenLastCalledWith('conv', 'Conversation prompt copied');

    resolveFirst?.();
    await firstPromise;

    expect(controller.getCopiedKey()).toBe('conv');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('lets a newer success finish before an older success without overwriting feedback', async () => {
    const onSuccess = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError: vi.fn() });

    let resolveOld: (() => void) | undefined;
    let resolveNew: (() => void) | undefined;
    const oldCopy = new Promise<void>((resolve) => {
      resolveOld = resolve;
    });
    const newCopy = new Promise<void>((resolve) => {
      resolveNew = resolve;
    });

    const oldPromise = controller.copy('sys', 'old', 'System prompt copied', () => oldCopy);
    const newPromise = controller.copy('conv', 'new', 'Conversation prompt copied', () => newCopy);

    resolveNew?.();
    await newPromise;
    expect(controller.getCopiedKey()).toBe('conv');

    resolveOld?.();
    await oldPromise;

    expect(controller.getCopiedKey()).toBe('conv');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith('conv', 'Conversation prompt copied');
  });

  it('ignores a stale rejection after a newer success', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError });

    let rejectOld: ((error: Error) => void) | undefined;
    const oldCopy = new Promise<void>((_resolve, reject) => {
      rejectOld = reject;
    });
    const newCopy = vi.fn(async () => undefined);

    const oldPromise = controller.copy('sys', 'old', 'System prompt copied', () => oldCopy);
    await controller.copy('conv', 'new', 'Conversation prompt copied', newCopy);

    rejectOld?.(new Error('late fail'));
    await oldPromise.catch(() => undefined);

    expect(onError).not.toHaveBeenCalled();
    expect(controller.getCopiedKey()).toBe('conv');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('emits only the latest failure toast when the current attempt fails', async () => {
    const onError = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess: vi.fn(), onError });
    const fail = vi.fn(async () => {
      throw new Error('copy failed');
    });

    await expect(controller.copy('link', 'x', 'Link copied', fail)).rejects.toThrow('copy failed');
    expect(onError).toHaveBeenCalledOnce();
    expect(controller.getCopiedKey()).toBe('');
  });

  it('invalidates in-flight work on navigation without remounting', async () => {
    const onSuccess = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError: vi.fn() });

    let resolveCopy: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolveCopy = resolve;
    });

    const pendingPromise = controller.copy('both', 'payload', 'Both prompts copied', () => pending);
    controller.invalidateForNavigation();

    resolveCopy?.();
    await pendingPromise;

    expect(onSuccess).not.toHaveBeenCalled();
    expect(controller.getCopiedKey()).toBe('');
  });

  it('cleans up timers on unmount invalidation', async () => {
    const onSuccess = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError: vi.fn() });
    const copy = vi.fn(async () => undefined);

    await controller.copy('link', 'url', 'Link copied', copy);
    controller.dispose();

    vi.advanceTimersByTime(COPY_FEEDBACK_DURATION_MS);
    expect(controller.getCopiedKey()).toBe('');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('handles two successes within 2s by resetting the timeout for the latest key', async () => {
    const onSuccess = vi.fn();
    const controller = createCopyFeedbackController({ onSuccess, onError: vi.fn() });
    const copy = vi.fn(async () => undefined);

    await controller.copy('sys', 'one', 'System prompt copied', copy);
    vi.advanceTimersByTime(1500);
    await controller.copy('conv', 'two', 'Conversation prompt copied', copy);

    expect(controller.getCopiedKey()).toBe('conv');

    vi.advanceTimersByTime(1500);
    expect(controller.getCopiedKey()).toBe('conv');

    vi.advanceTimersByTime(500);
    expect(controller.getCopiedKey()).toBe('');
  });
});
