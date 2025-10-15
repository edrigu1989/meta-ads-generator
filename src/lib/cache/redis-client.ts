/**
 * Redis Cache Client (Upstash)
 *
 * Caches research results to reduce API costs.
 * Research data doesn't change frequently, so 7-day TTL is reasonable.
 */

import { ResearchResult } from '@/types/research';

// Cache TTL: 7 days in seconds
const CACHE_TTL = 7 * 24 * 60 * 60; // 604800 seconds

/**
 * Check if Redis is configured
 */
function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
  // Normalize URL to avoid cache misses due to trailing slashes, www, etc.
  try {
    const normalizedUrl = new URL(url);
    const host = normalizedUrl.hostname.replace('www.', '');
    return `research:${host}`;
  } catch {
    // If URL parsing fails, use sanitized string
    return `research:${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

/**
 * Get cached research result
 *
 * @param url - Website URL
 * @returns Cached research result or null if not found/expired
 */
export async function getCachedResearch(url: string): Promise<ResearchResult | null> {
  if (!isRedisConfigured()) {
    console.log('[Cache] Redis not configured, skipping cache check');
    return null;
  }

  try {
    const key = getCacheKey(url);
    console.log(`[Cache] Checking cache for key: ${key}`);

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[Cache] Redis GET failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('[Cache] Raw response from Redis:', JSON.stringify(data, null, 2));

    if (!data.result) {
      console.log('[Cache] Cache miss');
      return null;
    }

    // Parse cached data
    // Upstash returns the stored value directly in result
    console.log('[Cache] Parsing result, type:', typeof data.result);

    let cachedData: ResearchResult;

    // Check if result is already an object (shouldn't happen with GET)
    // or if it's a stringified JSON
    if (typeof data.result === 'string') {
      cachedData = JSON.parse(data.result) as ResearchResult;
    } else {
      // If it's already an object, use it directly
      cachedData = data.result as ResearchResult;
    }

    console.log('[Cache] Parsed data keys:', Object.keys(cachedData));
    console.log('[Cache] Has brand?:', !!cachedData.brand);

    // Check if cache is still valid (within TTL)
    const cachedTime = new Date(cachedData.timestamp).getTime();
    const now = Date.now();
    const ageInDays = (now - cachedTime) / (1000 * 60 * 60 * 24);

    console.log(`[Cache] Cache hit! Age: ${ageInDays.toFixed(1)} days`);

    // Mark as cached
    cachedData.cached = true;

    return cachedData;
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
}

/**
 * Store research result in cache
 *
 * @param url - Website URL
 * @param data - Research result to cache
 */
export async function setCachedResearch(
  url: string,
  data: ResearchResult
): Promise<void> {
  if (!isRedisConfigured()) {
    console.log('[Cache] Redis not configured, skipping cache write');
    return;
  }

  try {
    const key = getCacheKey(url);
    console.log(`[Cache] Storing in cache with key: ${key}`);

    // Ensure cached flag is false when storing
    const dataToCache = {
      ...data,
      cached: false,
    };

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/set/${key}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: JSON.stringify(dataToCache),
          ex: CACHE_TTL, // Set expiration time
        }),
      }
    );

    if (!response.ok) {
      console.warn('[Cache] Redis SET failed:', response.statusText);
      return;
    }

    console.log(`[Cache] Successfully cached research (TTL: 7 days)`);
  } catch (error) {
    console.error('[Cache] Error writing to cache:', error);
  }
}

/**
 * Delete cached research (force refresh)
 *
 * @param url - Website URL
 */
export async function deleteCachedResearch(url: string): Promise<void> {
  if (!isRedisConfigured()) {
    console.log('[Cache] Redis not configured, skipping cache delete');
    return;
  }

  try {
    const key = getCacheKey(url);
    console.log(`[Cache] Deleting cache for key: ${key}`);

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/del/${key}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[Cache] Redis DEL failed:', response.statusText);
      return;
    }

    console.log('[Cache] Cache deleted successfully');
  } catch (error) {
    console.error('[Cache] Error deleting from cache:', error);
  }
}

/**
 * Get cache age in days
 *
 * @param timestamp - Cached data timestamp
 * @returns Age in days
 */
export function getCacheAge(timestamp: string): number {
  const cachedTime = new Date(timestamp).getTime();
  const now = Date.now();
  return (now - cachedTime) / (1000 * 60 * 60 * 24);
}

/**
 * Format cache age for display
 *
 * @param timestamp - Cached data timestamp
 * @returns Formatted string (e.g., "hace 2 días")
 */
export function formatCacheAge(timestamp: string): string {
  const days = Math.floor(getCacheAge(timestamp));

  if (days === 0) {
    return 'hace menos de 1 día';
  } else if (days === 1) {
    return 'hace 1 día';
  } else {
    return `hace ${days} días`;
  }
}
