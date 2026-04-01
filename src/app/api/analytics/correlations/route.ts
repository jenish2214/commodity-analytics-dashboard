import { NextResponse } from "next/server";
import { pearsonCorrelation } from "@/services/analytics/correlation";

const YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart";

type PairDef = {
  id: string;
  label: string;
  a: string;
  b: string;
};

const PAIRS: PairDef[] = [
  { id: "gold_inr", label: "Gold vs USD/INR", a: "GC=F", b: "INR=X" },
  { id: "silver_gold", label: "Silver vs Gold", a: "SI=F", b: "GC=F" },
  { id: "oil_inflation", label: "WTI vs TIP (inflation sleeve)", a: "CL=F", b: "TIP" },
  { id: "copper_growth", label: "Copper vs ACWI (global equities)", a: "HG=F", b: "ACWI" },
];

async function fetchDailyCloses(ticker: string): Promise<number[]> {
  try {
    const url = `${YAHOO}/${encodeURIComponent(ticker)}?interval=1d&range=3mo`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      chart?: { result?: Array<{ indicators?: { quote?: Array<{ close?: (number | null)[] }> } }> };
    };
    const closes =
      json.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    return closes.filter((c): c is number => c != null && Number.isFinite(c));
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const rows = await Promise.all(
      PAIRS.map(async (p) => {
        try {
          const [ca, cb] = await Promise.all([
            fetchDailyCloses(p.a),
            fetchDailyCloses(p.b),
          ]);
          const n = Math.min(ca.length, cb.length, 60);
          if (n < 10) {
            return {
              id: p.id,
              label: p.label,
              correlation: null as number | null,
              sample: 0,
            };
          }
          const a = ca.slice(-n);
          const b = cb.slice(-n);
          return {
            id: p.id,
            label: p.label,
            correlation: pearsonCorrelation(a, b),
            sample: n,
          };
        } catch {
          return {
            id: p.id,
            label: p.label,
            correlation: null as number | null,
            sample: 0,
          };
        }
      })
    );

    return NextResponse.json({
      pairs: rows,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[correlations]", e);
    return NextResponse.json(
      {
        pairs: [],
        error: e instanceof Error ? e.message : "correlation fetch failed",
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
