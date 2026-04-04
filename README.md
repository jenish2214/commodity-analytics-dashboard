# Commodity Analytics Dashboard (CommodityX)

This project is a **web dashboard** for watching **commodity markets** (things like gold, oil, and crops), exploring **charts and analytics**, and keeping a simple **portfolio view** on your screen. It is built to feel like a professional “trading terminal” while staying readable for everyday users.

---

## Read this first (no technical background needed)

### What is this?

Think of it as a **single website** where you can:

- See **what many commodities are doing** at a glance (up, down, or flat).
- Open **charts** to study price history over different time ranges.
- Read **market news** and check **global stock indices** when you want wider context.
- Use **Analytics** and **Risk analysis** pages for deeper views (patterns, relationships, and risk-style summaries)—still based on the same market information as the home screen.
- Visit **AI insights** for **structured, text-style summaries** tied to live price action (these are **explainable narratives**, not a human advisor and not guaranteed predictions).
- Adjust **Settings** (appearance, profile fields, and similar preferences) and have many choices **remembered on this device**.

You **do not** need to install anything to **understand** what the app does; the sections below describe every main area in everyday language. If you only want to **run** it on your own computer, skip to [Running the app on your computer](#running-the-app-on-your-computer).

### Who is it for?

- People who follow **commodities** and want a **clear, visual** workspace.
- Anyone learning how dashboards combine **prices, charts, news, and portfolio ideas** in one place.
- Teams or individuals who may later connect **real accounts or APIs** (optional keys can extend data sources—see the technical note at the end).

### Important honesty box (please read)

- Numbers and charts come from **public market data and feeds**. They can be **delayed**, **incomplete**, or **unavailable** if a data provider or your network has an issue.
- Nothing in this app is **personal financial, legal, or tax advice**. Always verify important decisions with a qualified professional.

---

## Tour of the app — what each part is for

Use the **sidebar** on larger screens or the **bottom navigation** on phones to move around. The **top bar** includes **search** (it filters lists like commodities on supporting pages), **currency** choice, **light/dark style**, and a **command palette** (keyboard: **Ctrl+K** on Windows or **⌘K** on Mac) to jump to a page quickly.

| Where you go | What you see there (in plain words) |
|--------------|-------------------------------------|
| **Dashboard** (home) | The main “workspace”: key stats, a performance chart area, commodity table, portfolio pie view, heatmaps, correlation views, risk and AI-style panels, seasonality and macro context, supply/demand style panels, and an activity feed—designed as one glanceable screen. |
| **Markets** | The **commodities** list and paths into **detail pages per symbol** with history and indicators (such as moving averages and RSI) where enabled. |
| **Portfolio** | A place to think about **holdings and allocation** (stored locally in your browser unless you extend the app). |
| **Analytics** | **Seasonality**, **correlations**, **heatmaps**, **macro indicators**, and chart workspace—similar analytics bundle to the terminal, laid out for exploration. |
| **Risk analysis** | A **risk-first** layout: volatility views, opportunity-style scans, correlations, and **alerts** so you can monitor downside and cross-asset relationships. |
| **AI insights** | Panels that turn recent **price behavior** into **structured narratives** and market-style commentary—deterministic and tied to the same feed as the rest of the app. |
| **Settings** | Profile-style fields, **theme** (including a workspace-style look), notifications, and sidebar behavior; Settings uses a **full-width** layout (no side rail) for focus. |
| **Market news** | Headlines from **RSS-style** sources, with filters where the UI provides them. |
| **Indices** | **Major regional indices** in one place. |
| **Trading** | Trading-oriented UI **if enabled** in your build (experimental or demo-style screens may live here). |

Across many pages you will also see a **ticker-style strip** and **session** information near the top—helpful context for when markets are typically active.

---

## What has been evolving lately (high level)

Recent work in this repository has focused on making the product **easier to navigate** and **richer to read**:

- **New dedicated pages** for **Analytics** and **Risk analysis** so deep views are not buried only on the home dashboard.
- A **command palette** and refined **top navigation** (search, currency, theme, alerts).
- **Terminal-style components**: commodity ticker, volatility strip, alert dock, and related panels for a cohesive “desk” experience.
- **Dashboard modules** such as KPI grids, market overview cards, AI and risk panels, seasonality, supply/demand, macro indicators, heatmaps, and correlation tools.
- **Design system** updates: shared **colors and motion** tokens, UI building blocks, and layout polish so the app feels consistent on desktop and mobile.

If something on your screen is not listed here, it may be **newer than this document**—the sidebar and command palette always reflect the **live** list of routes.

---

## How information reaches your screen (simple version)

1. The app asks **server routes** (small programs that run with the website) to fetch **commodity quotes**, **chart history**, **news**, **indices**, and related analytics.
2. Those routes talk to **external providers** (for example public market chart endpoints and news feeds). Results are **cached for a short time** so the app stays fast and does not hammer providers.
3. Your browser **shows** the latest successful data and **remembers** your personal settings and portfolio-style inputs **on this device**.

Optional **API keys** (in environment variables) can unlock extra providers inside the financial data engine; without keys, many features still work using public endpoints.

---

## Running the app on your computer

Only needed if you are **developing** or **hosting** your own copy.

1. Install **[Node.js](https://nodejs.org/)** (version 18 or newer is a good target).
2. Open a terminal in the project folder (the folder that contains this `README.md`).
3. Run:

```bash
npm install
npm run dev
```

4. Open the address the terminal prints (usually **http://localhost:3000**).

**Build for production** (faster, optimized site):

```bash
npm run build
npm start
```

**Check code style** (for contributors):

```bash
npm run lint
```

---

## Your privacy and data on this device

- **Settings** (theme, name, email display, currency, notifications, sidebar, etc.) are typically saved in **browser storage** (for example `localStorage`) so the app remembers you **on this browser**.
- **Portfolio** entries are also kept **locally** unless you change the app to sync elsewhere.
- **Market prices** are not “fake by default”: when the network allows, the app loads **live-style** data; if a request fails, you may see empty states or stale timestamps until the next successful refresh.

---

## If something looks wrong

- **Empty charts or tables**: your network may block a provider, or the service may be temporarily down. Wait a few minutes and refresh.
- **News missing**: some RSS sources rate-limit or change URLs; the implementation may skip broken feeds.
- **Indices look quiet**: outside of normal market hours, some symbols update less often—this is expected behavior for many free feeds.

---

## For developers and contributors (short reference)

| Topic | Detail |
|-------|--------|
| **Stack** | [Next.js](https://nextjs.org/) 14 (App Router), [React](https://react.dev/) 18, [TypeScript](https://www.typescriptlang.org/), [Zustand](https://github.com/pmndrs/zustand) for state, [Recharts](https://recharts.org/) for charts, [lucide-react](https://lucide.dev/) for icons. |
| **Main code folders** | `src/app` — pages and API routes · `src/components` — UI and views · `src/store` — client state · `src/lib` — data engine, constants, calculations · `src/styles` — global and component CSS · `src/types` — shared types. |
| **Example API routes** | `api/commodities`, `api/commodities/chart`, `api/news`, `api/indices`, `api/portfolio`, `api/analytics/correlations`, `api/indian-commodities` (exact set may grow). |

When contributing, keep changes **focused**, run `npm run lint`, and match existing patterns in the codebase.

---

## Summary

**CommodityX / Commodity Analytics Dashboard** is a **modern commodity workspace**: prices, charts, news, indices, portfolio context, analytics, risk views, and AI-style narratives—organized so both **curious readers** and **technical users** can get value. Start from the **Dashboard**, use **Markets** for detail, and open **Analytics**, **Risk analysis**, or **AI insights** when you want a deeper story from the same underlying market picture.
