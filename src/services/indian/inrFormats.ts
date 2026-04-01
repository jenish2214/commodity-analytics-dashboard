/**
 * Indian retail-style reference conversions from international benchmarks.
 * Pure functions — safe to call from client or server.
 */

/** Troy ounce mass used for precious metals (matches MCX-style conventions). */
export const GRAMS_PER_TROY_OZ = 31.1035;

export type GoldCaratInr = {
  perGram24k: number;
  perGram22k: number;
  perGram18k: number;
  per10g24k: number;
  per10g22k: number;
  per10g18k: number;
};

export type SilverInrRef = {
  perGram: number;
  perKg: number;
};

export type CrudeInrRef = {
  inrPerBarrel: number;
  inrPerLitre: number;
};

/** 22K = 24K × 0.916; 18K = 24K × 0.75 */
export function goldInrFromSpot(params: {
  goldUsdPerTroyOz: number;
  usdInr: number;
}): GoldCaratInr | null {
  try {
    const spot = params.goldUsdPerTroyOz;
    const fx = params.usdInr;
    if (
      !Number.isFinite(spot) ||
      !Number.isFinite(fx) ||
      spot <= 0 ||
      fx <= 0
    ) {
      return null;
    }
    const k24 = (spot * fx) / GRAMS_PER_TROY_OZ;
    const k22 = k24 * 0.916;
    const k18 = k24 * 0.75;
    return {
      perGram24k: k24,
      perGram22k: k22,
      perGram18k: k18,
      per10g24k: k24 * 10,
      per10g22k: k22 * 10,
      per10g18k: k18 * 10,
    };
  } catch {
    return null;
  }
}

export function silverInrFromSpot(params: {
  silverUsdPerTroyOz: number;
  usdInr: number;
}): SilverInrRef | null {
  try {
    const spot = params.silverUsdPerTroyOz;
    const fx = params.usdInr;
    if (
      !Number.isFinite(spot) ||
      !Number.isFinite(fx) ||
      spot <= 0 ||
      fx <= 0
    ) {
      return null;
    }
    const inrPerTroyOz = spot * fx;
    const perGram = inrPerTroyOz / GRAMS_PER_TROY_OZ;
    return { perGram, perKg: perGram * 1000 };
  } catch {
    return null;
  }
}

const LITRES_PER_BARREL = 159;

export function crudeInrFromUsdBarrel(params: {
  usdPerBarrel: number;
  usdInr: number;
}): CrudeInrRef | null {
  try {
    const usd = params.usdPerBarrel;
    const fx = params.usdInr;
    if (!Number.isFinite(usd) || !Number.isFinite(fx) || usd <= 0 || fx <= 0) {
      return null;
    }
    const inrPerBarrel = usd * fx;
    return {
      inrPerBarrel,
      inrPerLitre: inrPerBarrel / LITRES_PER_BARREL,
    };
  } catch {
    return null;
  }
}
