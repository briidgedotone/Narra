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
  private cache = new Map<string, { value: unknown; expires: number }>();

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

// Clear cache on startup to ensure fresh state (for development)
if (process.env.NODE_ENV === "development") {
  cache.clear();
}

// Cache key utilities
export const cacheKeys = {
  tiktokProfile: (handle: string) => `tiktok:profile:${handle}`,
  tiktokVideos: (handle: string, count: number) =>
    `tiktok:videos:${handle}:${count}`,
  tiktokTranscript: (videoUrl: string) => {
    // Create a simple hash from the full URL to ensure uniqueness
    let hash = 0;
    for (let i = 0; i < videoUrl.length; i++) {
      const char = videoUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive number and add URL length for extra uniqueness
    const uniqueId = Math.abs(hash).toString(36) + videoUrl.length.toString(36);
    return `tiktok:transcript:${uniqueId}`;
  },
  instagramProfile: (handle: string) => `instagram:profile:${handle}`,
  instagramPosts: (handle: string, count: number) =>
    `instagram:posts:${handle}:${count}`,
  instagramTranscript: (postUrl: string) => {
    // Create a simple hash from the full URL to ensure uniqueness
    let hash = 0;
    for (let i = 0; i < postUrl.length; i++) {
      const char = postUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive number and add URL length for extra uniqueness
    const uniqueId = Math.abs(hash).toString(36) + postUrl.length.toString(36);
    return `instagram:transcript:${uniqueId}`;
  },
};

// Cache TTL constants (in seconds)
export const cacheTTL = {
  profile: 300, // 5 minutes for profiles
  posts: 180, // 3 minutes for posts
  search: 120, // 2 minutes for search results
  transcript: 300, // 5 minutes for transcripts (same as profiles for testing)
};
