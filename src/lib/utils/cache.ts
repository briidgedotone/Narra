/**
 * Simple browser cache utility using sessionStorage
 * Automatically expires data after 5 minutes
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Ignore storage errors (private mode, quota exceeded, etc.)
  }
}

export function clearCache(keyPrefix?: string): void {
  try {
    if (keyPrefix) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(keyPrefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } else {
      sessionStorage.clear();
    }
  } catch {
    // Ignore storage errors
  }
}
