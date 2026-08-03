export {};

/**
 * Legacy acts were built as independent DOM enhancers. Each one created its own
 * MutationObserver and a short polling loop. This compatibility kernel keeps the
 * existing playable content, but coalesces all observer callbacks into one frame.
 * It is intentionally loaded before every runtime enhancer in main.tsx.
 */
const NativeMutationObserver = window.MutationObserver;
const nativeSetInterval = window.setInterval.bind(window);

type ObserverEntry = {
  callback: MutationCallback;
  instance: MutationObserver;
  active: boolean;
};

const entries = new Set<ObserverEntry>();
let pendingRecords: MutationRecord[] = [];
let frameId = 0;
let sharedObserver: MutationObserver | null = null;

function flushObservers(): void {
  frameId = 0;
  const records = pendingRecords;
  pendingRecords = [];

  entries.forEach((entry) => {
    if (!entry.active) return;
    try {
      entry.callback(records, entry.instance);
    } catch (error) {
      console.error('[DBR runtime observer]', error);
    }
  });

  window.dispatchEvent(new CustomEvent('dbr:runtime-settled'));
}

function scheduleFlush(): void {
  if (frameId) return;
  frameId = window.requestAnimationFrame(flushObservers);
}

function ensureSharedObserver(): void {
  if (sharedObserver || !document.documentElement) return;
  sharedObserver = new NativeMutationObserver((records) => {
    pendingRecords.push(...records);
    scheduleFlush();
  });
  sharedObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

class CoalescedMutationObserver implements MutationObserver {
  private readonly entry: ObserverEntry;

  constructor(callback: MutationCallback) {
    this.entry = {
      callback,
      instance: this as unknown as MutationObserver,
      active: false
    };
  }

  observe(): void {
    this.entry.active = true;
    entries.add(this.entry);
    ensureSharedObserver();
    scheduleFlush();
  }

  disconnect(): void {
    this.entry.active = false;
    entries.delete(this.entry);
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

window.MutationObserver = CoalescedMutationObserver as unknown as typeof MutationObserver;

// Polling loops created while side-effect modules are evaluated are clamped to a
// human-imperceptible cadence. The native API is restored after module startup.
window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const safeDelay = Math.max(Number(timeout) || 0, 900);
  return nativeSetInterval(handler, safeDelay, ...args);
}) as typeof window.setInterval;

window.setTimeout(() => {
  window.setInterval = nativeSetInterval as typeof window.setInterval;
}, 0);

document.documentElement.dataset.dbrPerformanceKernel = 'coalesced-v1';
