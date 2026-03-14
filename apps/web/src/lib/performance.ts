/**
 * Performance utilities for MindLink
 */

// Throttle function — max N calls per interval
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

// Memoize last result
export function memoizeLast<T extends (...args: any[]) => any>(fn: T): T {
  let lastArgs: Parameters<T> | null = null;
  let lastResult: ReturnType<T> | null = null;

  return ((...args: Parameters<T>) => {
    if (lastArgs && args.every((a, i) => a === lastArgs![i])) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  }) as T;
}

// RAF-throttled function (max 60fps)
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  return (...args) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
}
