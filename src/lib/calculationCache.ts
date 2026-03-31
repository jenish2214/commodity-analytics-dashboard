/**
 * Calculation Cache Manager
 * ===========================
 * In-memory LRU cache for calculation results
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

class CalculationCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttlMinutes: number = 5) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  private generateKey(params: Record<string, any>): string {
    // Create deterministic key from params
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    return JSON.stringify(sorted);
  }

  get(params: Record<string, any>): T | undefined {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update hit count and move to end (LRU)
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(params: Record<string, any>, value: T): void {
    const key = this.generateKey(params);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / (entries.length + totalHits) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: Math.round(hitRate * 100),
    };
  }
}

// Global cache instance for portfolio calculations
export const portfolioCache = new CalculationCache<any>(50, 10);

// Quick lookup cache for slider inputs (very short TTL)
export const sliderCache = new CalculationCache<any>(20, 0.5); // 30 seconds
