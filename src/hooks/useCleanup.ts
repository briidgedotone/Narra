import { useEffect, useRef } from "react";

/**
 * Hook for automatic cleanup of resources on component unmount
 * Prevents memory leaks by ensuring proper cleanup
 */
export function useCleanup() {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  /**
   * Register a cleanup function to be called on unmount
   */
  const addCleanup = (cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  };

  /**
   * Add event listener with automatic cleanup
   */
  const addEventListener = (
    element: Element | Window | Document,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(event, listener, options);
    addCleanup(() => element.removeEventListener(event, listener));
  };

  /**
   * Create interval with automatic cleanup
   */
  const setManagedInterval = (callback: () => void, delay: number) => {
    const intervalId = setInterval(callback, delay);
    addCleanup(() => clearInterval(intervalId));
    return intervalId;
  };

  /**
   * Create timeout with automatic cleanup
   */
  const setManagedTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay);
    addCleanup(() => clearTimeout(timeoutId));
    return timeoutId;
  };

  /**
   * Create AbortController with automatic cleanup
   */
  const createAbortController = () => {
    const controller = new AbortController();
    addCleanup(() => controller.abort());
    return controller;
  };

  // Execute all cleanup functions on unmount
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn("Cleanup function failed:", error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return {
    addCleanup,
    addEventListener,
    setManagedInterval,
    setManagedTimeout,
    createAbortController,
  };
}

/**
 * Hook for debounced functions with automatic cleanup
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { addCleanup } = useCleanup();

  // Cleanup timeout on unmount
  addCleanup(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  });

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), delay);
  }) as T;

  return debouncedFn;
}

/**
 * Hook for throttled functions with automatic cleanup
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { addCleanup } = useCleanup();

  // Cleanup timeout on unmount
  addCleanup(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  });

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      func(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  }) as T;

  return throttledFn;
}
