// Redis cache service
interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// In-memory cache fallback for development (Redis alternative)
class MemoryCache implements CacheService {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || 300; // Default 5 minutes
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Create cache instance (using memory cache for simplicity)
export const cache = new MemoryCache();

// Cache key utilities
export const cacheKeys = {
  tiktokProfile: (handle: string) => `tiktok:profile:${handle}`,
  instagramProfile: (handle: string) => `instagram:profile:${handle}`,
};

// Cache TTL constants (in seconds)
export const cacheTTL = {
  profile: 300, // 5 minutes for profiles
  posts: 180, // 3 minutes for posts
  search: 120, // 2 minutes for search results
};
