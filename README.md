# Commodity Analytics Dashboard

A **Next.js 14** and **React 18** application for real-time commodity prices, global indices, market news, and **production-style quantitative analytics**. The stack emphasizes **TypeScript**, clear data flow, and reusable **mathematical/statistical** calculations suitable for traders, analysts, and portfolio-focused users.

---

## Purpose and features

### What the dashboard does

- **Commodities**: Gold, silver, WTI crude, natural gas, copper (live-style quotes via Yahoo Finance chart API).
- **Market indices**: Broad coverage of major regional indices.
- **News**: Aggregated financial headlines from multiple RSS sources.
- **Charts**: Line, area, and candlestick views with SMA, EMA, RSI, and volume.
- **AI Insights**: Entry point for **quantitative and hedge-style analytics**—compact summary on `/ai-insights`, full **model suite and charts** on `/quant-calculator`.
- **Portfolio**: Track holdings and performance locally.

### Who it is for

- Traders and investors monitoring commodities and macro drivers.
- Analysts who want **transparent, formula-driven** risk and return metrics—not only narrative “signals.”
- Builders extending **quant models** and UI in a single TypeScript codebase.

---

## AI Insights and quantitative engine

### Design goals (product and engineering)

- **Model families in one place**: Classical quant (volatility, Sharpe, drawdown), **options greeks / Black–Scholes-style** outputs, **Monte Carlo** paths, **CAPM** and factor-style fields, **VaR** variants (historical, parametric, MC, CVaR, Cornish–Fisher), **stress scenarios**, **hedge-fund-style ratios** (Sortino, Calmar, capture ratios, pain/ulcer indices), **efficient frontier** hints, and tail-risk measures—implemented in a dedicated store and surfaced with **Recharts** where it helps comprehension.
- **Chart-first explanations**: Users see distributions, comparisons, and allocation views alongside numbers so intuition matches the math.
- **Interactive workflows**: On **`/ai-insights`**, the **model catalog** (`AiInsightsModelHub`) lists every model with a **formula summary**, **Python reference** (`calculations/*.py`), a **mini bar chart** of key outputs, and a deep link to **`/quant-calculator?tab=…&focus=…`** (for example **Hedge metrics only** via the “Hedge metrics” chip or `focus=hedge`).
- **Calculation transparency**: Prefer showing inputs, intermediate assumptions, and outputs per model so “black box” behavior is minimized; keep a **single source of truth** in `quantCalculatorStore` for deterministic, testable logic.
- **Production-minded logic**: Typed interfaces for inputs and metrics, validated allocations (e.g. weights summing to 100%), defensive handling around missing data in APIs, and separated **server routes** vs **client** state.

### Current implementation (high level)

| Area | Location |
|------|----------|
| AI Insights page (catalog + compact calculator) | `src/components/views/AiInsightsView.tsx`, `src/components/AiInsightsModelHub.tsx`, `src/components/CompactPortfolioCalculator.tsx` |
| Model definitions & deep-link helpers | `src/lib/quantModelCatalog.ts` |
| Full calculator + charts + URL `tab` / `focus` | `src/app/(dashboard)/quant-calculator/page.tsx` |
| Metrics, formulas (TypeScript) | `src/store/quantCalculatorStore.ts` (`syncMetricsFromInput` refreshes without delay or history noise) |
| Optional Python numerics (reference / API) | `calculations/` (`portfolio_metrics.py`, `risk_models.py`, `hedge_fund_metrics.py`, …) and `src/app/api/calculate/*` |
| Legacy narrative “insights” API (if still present) | `src/app/api/ai-insights/route.ts` |

On **`/quant-calculator`**, users can open deep panels for portfolio inputs, risk profile, and **per-model visualization** (line, bar, area, pie, scatter) aligned with the computed metrics.

---

## Quick start

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

### Install and run

```bash
git clone <repository-url>
cd Deshbord
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project structure

```
src/
├── app/                    # Next.js App Router — pages and API routes
│   ├── api/                # commodities, news, indices, chart, ai-insights, …
│   └── (dashboard)/        # Dashboard routes (see Pages below)
├── components/             # Layout, views, charts, AiInsightsModelHub, calculators
├── lib/                    # quantModelCatalog, constants, helpers
├── store/                  # Zustand stores (market data, news, quant calculator, …)
├── types/                  # Shared TypeScript types
├── styles/                 # globals, tokens, component CSS
└── utils/                  # Formatting helpers
```

### Notable API routes

- `api/commodities` — commodity quotes (Yahoo Finance chart endpoint).
- `api/commodities/chart` — historical series for charting.
- `api/news` — RSS aggregation.
- `api/indices` — index quotes.
- `api/ai-insights` — optional server-generated narrative/signals (if enabled in your branch).

---

## Technical architecture

### Data flow

```
External sources (Yahoo Finance, RSS, …)
        ↓
Next.js Route Handlers (fetch, cache, revalidate)
        ↓
Client components + Zustand (UI state, preferences, quant inputs)
```

### Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript.
- **State**: Zustand (with persistence where configured).
- **Charts**: Recharts.
- **Icons**: lucide-react.
- **Styling**: CSS custom properties (design tokens), responsive layouts.
- **Exports**: PDF/CSV-related tooling where included in dependencies (e.g. `pdf-lib` for reports).

### Caching (typical)

- Commodity and index quotes: on the order of minutes (see route `revalidate` values).
- Chart history: longer cache where appropriate.
- News: periodic revalidation to balance freshness and rate limits.

---

## Features (summary)

### Charts

- Line, area, candlestick; indicators: SMA, EMA, RSI, volume.
- User preferences persisted for indicator choices and ranges.

### News

- Multiple categories and sources; filter by category and source.

### Indices

- Global coverage with refresh aligned to API caching.

### Quant calculator

- Multi-asset allocation, risk profile, and **unified metrics object** combining return, risk, simulation, options sensitivities, VaR families, stress tests, and hedge-style performance ratios—see `QuantitativeMetrics` in `quantCalculatorStore.ts`.

---

## Development guide

### New API route

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}
```

### New client component

```typescript
"use client";

export function Example() {
  return <div>Example</div>;
}
```

### New dashboard page

Add `src/app/(dashboard)/your-route/page.tsx` and register navigation if you use a shared sidebar.

---

## Configuration

### Environment

Copy `.env.example` to `.env.local` when provided. Many features work with **public** endpoints only; optional variables can override base URLs (see project `.env.example` if present).

### Local persistence

- **Settings** (theme, profile fields, notifications, sidebar): stored under browser `localStorage` (e.g. `ca_user_settings`).
- **Portfolio** items: `ca_portfolio` (or as defined in store).
- **Quant inputs**: may persist via Zustand `persist` in `quantCalculatorStore`—check middleware configuration in the store file.

Market quotes are **not** “demo-only”: commodity routes fetch live** market data from Yahoo when the network allows; failures fall back per route implementation.

---

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in the Vercel project dashboard as needed.

### Docker (example)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

- **Charts empty**: Check browser network tab for `/api/commodities/chart` and CORS/network errors; Yahoo responses can fail from some networks—retry after cache window.
- **News missing**: RSS hosts may block or throttle; verify feeds in `api/news` implementation.
- **Indices stale**: Expected outside cash session hours for some symbols.

---

## Contributing

1. Fork and branch: `git checkout -b feature/your-feature`
2. Keep changes focused; match existing TypeScript and CSS patterns.
3. Run `npm run lint` before opening a PR.

---

## License

Open source under the [MIT License](LICENSE).

---

## Support

- **Bugs**: GitHub Issues.
- **Features / discussion**: GitHub Discussions.

---

## Appendix

### Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Overview, stats, market summary |
| Commodities | `/commodities` | List and charts |
| Commodity detail | `/commodities/[symbol]` | History and indicators |
| Portfolio | `/portfolio` | Holdings and P/L |
| **AI Insights** | `/ai-insights` | Compact quant entry; link to full calculator |
| **Quant calculator** | `/quant-calculator` | Full models, charts, exports |
| Market news | `/market-news` | News feed |
| Indices | `/indices` | Global indices |
| Trading | `/trading` | Trading-oriented UI (if enabled) |
| Settings | `/settings` | Profile, theme, notifications |

### Settings and theme

- Open **Settings** from the **profile avatar** in the sidebar (sidebar may hide on Settings for a full-width layout).
- **Theme**: Dark/light via Appearance; transitions use shared duration tokens in CSS.
- **Typography**: Poppins (Google Fonts) applied globally.

### Acknowledgments

- Market data endpoints rely on public Yahoo Finance chart APIs and similar—subject to their terms and availability.
- Built with Next.js, React, Zustand, Recharts, and lucide-react.

---

**Start with `npm run dev`**, open **AI Insights** for the quant summary, then **Open** the full **Quant calculator** for chart-backed, model-level analytics.
