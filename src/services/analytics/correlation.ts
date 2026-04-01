/**
 * Pearson correlation on aligned numeric series (same length).
 */
export function pearsonCorrelation(a: number[], b: number[]): number | null {
  try {
    const n = Math.min(a.length, b.length);
    if (n < 3) return null;
    let sumA = 0;
    let sumB = 0;
    for (let i = 0; i < n; i++) {
      sumA += a[i];
      sumB += b[i];
    }
    const meanA = sumA / n;
    const meanB = sumB / n;
    let num = 0;
    let denA = 0;
    let denB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA;
      const db = b[i] - meanB;
      num += da * db;
      denA += da * da;
      denB += db * db;
    }
    const den = Math.sqrt(denA * denB);
    if (den === 0 || !Number.isFinite(den)) return null;
    const r = num / den;
    if (!Number.isFinite(r)) return null;
    return Math.max(-1, Math.min(1, r));
  } catch {
    return null;
  }
}
