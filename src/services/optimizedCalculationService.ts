/**
 * Optimized Calculation Service
 * =============================
 * High-performance frontend service with intelligent caching
 */

import { PortfolioInput } from '@/lib/pythonRunner';
import { portfolioCache, sliderCache } from '@/lib/calculationCache';

const API_BASE = '/api/calculate';

// Pending requests tracker for deduplication
const pendingRequests: Map<string, Promise<any>> = new Map();

/**
 * Deduplicated fetch - prevents multiple identical requests
 */
async function deduplicatedFetch<T>(
  cacheKey: Record<string, any>,
  fetchFn: () => Promise<T>
): Promise<T> {
  const key = JSON.stringify(cacheKey);

  // Check pending requests
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending;
  }

  // Create new request
  const request = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
}

/**
 * Run full portfolio calculation with aggressive caching
 */
export async function calculateFullPortfolioOptimized(
  input: PortfolioInput,
  forceRefresh: boolean = false
): Promise<any> {
  // Check cache first
  if (!forceRefresh) {
    const cached = portfolioCache.get(input);
    if (cached) {
      return cached;
    }
  }

  // Deduplicated fetch
  return deduplicatedFetch(input, async () => {
    const response = await fetch(`${API_BASE}/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Calculation failed');
    }

    const result = await response.json();

    // Store in cache
    portfolioCache.set(input, result);

    return result;
  });
}

/**
 * Quick calculation for slider inputs (short TTL cache)
 */
export async function calculateQuickForSlider(
  allocation: Record<string, number>,
  totalInvestment: number
): Promise<any> {
  const cacheKey = { allocation, totalInvestment, type: 'slider' };

  // Use short-lived cache for sliders
  const cached = sliderCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Deduplicated fetch
  return deduplicatedFetch(cacheKey, async () => {
    const response = await fetch(`${API_BASE}/portfolio/optimized?allocation=${JSON.stringify(allocation)}&totalInvestment=${totalInvestment}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Quick calculation failed');
    }

    const result = await response.json();

    // Store in short-term cache
    sliderCache.set(cacheKey, result);

    return result;
  });
}

/**
 * Batch multiple calculations into single request
 */
export async function calculateBatch(inputs: PortfolioInput[]): Promise<any[]> {
  // For now, run in parallel with limited concurrency
  const concurrency = 3;
  const results: any[] = [];

  for (let i = 0; i < inputs.length; i += concurrency) {
    const batch = inputs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((input) => calculateFullPortfolioOptimized(input))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Preload calculation (warm cache for predicted next state)
 */
export function preloadCalculation(input: PortfolioInput): void {
  // Run in background, don't await
  calculateFullPortfolioOptimized(input).catch(() => {
    // Silently fail preloads
  });
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { portfolio: any; slider: any } {
  return {
    portfolio: portfolioCache.getStats(),
    slider: sliderCache.getStats(),
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  portfolioCache.clear();
  sliderCache.clear();
}
