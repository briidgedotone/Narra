/**
 * Memory optimization utilities
 * Helps prevent memory leaks and optimize component cleanup
 */

// Cache for cleanup functions
const cleanupFunctions = new Set<() => void>();

/**
 * Register a cleanup function to be called on app/component unmount
 */
export function registerCleanup(cleanupFn: () => void) {
  cleanupFunctions.add(cleanupFn);

  // Return unregister function
  return () => {
    cleanupFunctions.delete(cleanupFn);
  };
}

/**
 * Execute all registered cleanup functions
 */
export function executeCleanup() {
  cleanupFunctions.forEach(fn => {
    try {
      fn();
    } catch (error) {
      console.warn("Cleanup function failed:", error);
    }
  });
  cleanupFunctions.clear();
}

/**
 * Debounced function cache cleanup
 * Prevents memory leaks from accumulated debounced functions
 */
const debouncedFunctions = new WeakMap();

export function createOptimizedDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;

  const debouncedFn = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;

  // Store cleanup function
  const cleanup = () => clearTimeout(timeoutId);
  debouncedFunctions.set(debouncedFn, cleanup);
  registerCleanup(cleanup);

  return debouncedFn;
}

/**
 * Optimized event listener management
 * Automatically cleans up event listeners to prevent memory leaks
 */
export class EventListenerManager {
  private listeners = new Map<Element, Map<string, EventListener>>();

  add(
    element: Element,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) {
    element.addEventListener(event, listener, options);

    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Map());
    }

    this.listeners
      .get(element)!
      .set(`${event}_${listener.toString().slice(0, 50)}`, listener);
  }

  remove(element: Element, event: string, listener: EventListener) {
    element.removeEventListener(event, listener);

    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.delete(`${event}_${listener.toString().slice(0, 50)}`);

      if (elementListeners.size === 0) {
        this.listeners.delete(element);
      }
    }
  }

  cleanup() {
    this.listeners.forEach((eventMap, element) => {
      eventMap.forEach((listener, eventKey) => {
        const eventParts = eventKey.split("_");
        const event = eventParts[0];
        if (event) {
          element.removeEventListener(event, listener);
        }
      });
    });
    this.listeners.clear();
  }
}

// Global event listener manager
export const globalEventManager = new EventListenerManager();

// Register global cleanup
registerCleanup(() => globalEventManager.cleanup());

/**
 * Memory-optimized object cache with automatic cleanup
 */
export class OptimizedCache<K, V> {
  private cache = new Map<K, V>();
  private accessTimes = new Map<K, number>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 100, maxAge = 5 * 60 * 1000) {
    // 5 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAge;

    // Cleanup old entries every minute
    const cleanupInterval = setInterval(() => this.cleanupOldEntries(), 60000);
    registerCleanup(() => clearInterval(cleanupInterval));
  }

  set(key: K, value: V) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.accessTimes.set(key, Date.now());
    }
    return value;
  }

  delete(key: K) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  private getOldestKey(): K | undefined {
    let oldestKey: K | undefined;
    let oldestTime = Infinity;

    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  private cleanupOldEntries() {
    const now = Date.now();
    const keysToDelete: K[] = [];

    this.accessTimes.forEach((time, key) => {
      if (now - time > this.maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }
}

/**
 * React component cleanup hook
 */
export function useMemoryCleanup(cleanupFn: () => void) {
  const cleanup = () => {
    try {
      cleanupFn();
    } catch (error) {
      console.warn("Component cleanup failed:", error);
    }
  };

  // Register cleanup to be called on unmount
  registerCleanup(cleanup);

  return cleanup;
}

/**
 * Optimize large arrays by implementing virtual scrolling helpers
 */
export function optimizeArrayRendering<T>(
  items: T[],
  visibleCount: number,
  startIndex: number = 0
): T[] {
  return items.slice(startIndex, startIndex + visibleCount);
}

/**
 * Memory usage monitoring (development only)
 */
export function logMemoryUsage(label: string) {
  if (
    process.env.NODE_ENV === "development" &&
    "performance" in window &&
    "memory" in (performance as any)
  ) {
    const memory = (performance as any).memory;
    console.log(`[Memory] ${label}:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
    });
  }
}
