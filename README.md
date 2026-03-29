# Commodity Analytics Dashboard

This folder contains a **web application** (a website that runs in your browser) for viewing **commodity markets**—things like gold, silver, and oil—with **charts**, **tables**, **portfolio-style summaries**, and **AI-style insights**. The numbers and news shown here are **sample data** for demonstration, so you can explore the screens safely. Your team can later connect it to real data sources.

---

## Who this guide is for

This document is written for **anyone** who needs to open the project, run it, or understand what it does—**no coding background required**. If you only need to **use** the app once it is running, skip to [How to open the app on your computer](#how-to-open-the-app-on-your-computer).

---

## What you can do in the app

| Area | In plain English |
|------|-------------------|
| **Dashboard** | Overview of portfolio-style totals, daily profit/loss, top commodity, AI sentiment, a price chart, and a market table. |
| **Commodities** | Same style of chart and table, focused on commodities. |
| **Commodity detail** | Click a commodity name in the table to see more detail: indicators, price history, volume, and an AI insight text. |
| **Portfolio** | Your sample holdings, profit/loss, and a pie chart of how allocations are split. |
| **AI Insights** | Written summaries, predictions, and buy/sell/hold-style signals (demo content). |
| **Market News** | Short news-style cards with source and time (demo content). |
| **Reports** | Buttons to download **PDF** or **CSV** example reports. |
| **Settings** | Change name and email (stored in this browser only), switch **light/dark** theme, and toggle notification preferences. |

The layout **adapts to the screen**: on a phone you get a **bottom menu**; on a tablet the side menu can be opened with a **menu button**; on a large desktop you see the **full side menu** all the time.

---

## What you need on your computer

You only need one free tool:

1. **Node.js** (version 18 or newer is ideal).  
   - Node.js is the standard way to run this type of project on your machine.  
   - If you are not sure it is installed: open a terminal (Command Prompt or PowerShell on Windows, Terminal on Mac) and type `node -v` and press Enter.  
   - If you see a version number (for example `v20.x.x`), you are ready.  
   - If not, download and install Node.js from the official website: [https://nodejs.org](https://nodejs.org) (choose the **LTS** version recommended for most users).

You do **not** need to configure databases, passwords, or API keys to run the demo. Everything works with **built-in sample data**.

---

## How to open the app on your computer

Follow these steps **in order**. Use the same folder where this project lives (for example `E:\dev\Deshbord` on Windows).

### Step 1 — Open a terminal in the project folder

- **Windows:** In File Explorer, open the project folder, click the address bar, type `powershell`, press Enter.  
- Or open PowerShell and move to the folder with:  
  `cd E:\dev\Deshbord`  
  (Change the path if your folder is somewhere else.)

### Step 2 — Install dependencies (first time only)

Run:

```bash
npm install
```

Wait until it finishes. This downloads the pieces the app needs. You only need to do this again if the project is copied to a new machine or someone adds new requirements.

### Step 3 — Start the app

Run:

```bash
npm run dev
```

When you see a message that the server is ready, open your **web browser** (Chrome, Edge, Firefox, etc.) and go to:

**[http://localhost:3000](http://localhost:3000)**

You should see the dashboard. To stop the server, go back to the terminal and press **Ctrl + C**.

### Step 4 — (Optional) Run a production-style build

For a **final check** that everything compiles (usually done by developers before deployment):

```bash
npm run build
npm run start
```

Then open **http://localhost:3000** again. `npm run start` runs the optimized version of the app.

---

## Project folder structure

This section shows **where files live** and **which part of the app** they belong to. You do not need to edit these files just to use the website—this is a map for your team.

### Top-level (project root)

| File / folder | Role in simple terms |
|---------------|----------------------|
| `package.json` | Lists app dependencies and shortcuts like `npm run dev`. |
| `next.config.mjs` | Next.js settings for building and running the project. |
| `tsconfig.json` | TypeScript compiler options (for developers). |
| `README.md` | This guide. |
| `src/` | **All application source code** lives here. |

### Full tree (`src/` and main app files)

```text
src/
├── app/
│   ├── layout.tsx                 ← Root layout: fonts (Inter), global CSS
│   ├── (dashboard)/
│   │   ├── layout.tsx             ← Wraps every page: sidebar, top bar, bottom nav, data loading
│   │   ├── page.tsx               ← URL: /                    → Dashboard (home)
│   │   ├── commodities/
│   │   │   ├── page.tsx           ← URL: /commodities
│   │   │   └── [symbol]/
│   │   │       └── page.tsx       ← URL: /commodities/gold (and other symbols)
│   │   ├── portfolio/
│   │   │   └── page.tsx           ← URL: /portfolio
│   │   ├── ai-insights/
│   │   │   └── page.tsx           ← URL: /ai-insights
│   │   ├── market-news/
│   │   │   └── page.tsx           ← URL: /market-news
│   │   ├── reports/
│   │   │   └── page.tsx           ← URL: /reports
│   │   └── settings/
│   │       └── page.tsx           ← URL: /settings
│   └── api/                       ← Backend-style URLs the browser can call (demo data)
│       ├── commodities/route.ts   ← GET /api/commodities (+ optional chart query)
│       ├── portfolio/route.ts     ← GET /api/portfolio
│       ├── ai-insights/route.ts   ← GET /api/ai-insights
│       ├── news/route.ts          ← GET /api/news
│       └── reports/
│           └── pdf/route.ts       ← GET /api/reports/pdf (download PDF)
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           ← Overall shell: sidebar + main column + backdrop (tablet)
│   │   ├── Sidebar.tsx            ← Left navigation (all sections)
│   │   ├── TopNavbar.tsx          ← Top bar: search, notifications, avatar, market status
│   │   └── BottomNav.tsx          ← Mobile bottom navigation
│   ├── providers/
│   │   └── AppProviders.tsx       ← Loads data on startup, live price tick, connects stores
│   ├── views/                     ← One file per main screen (page content)
│   │   ├── DashboardView.tsx       ← Dashboard: stats, chart, table
│   │   ├── CommoditiesView.tsx     ← Commodities page
│   │   ├── CommodityDetailView.tsx ← Single commodity detail
│   │   ├── PortfolioView.tsx       ← Portfolio holdings + pie chart
│   │   ├── AiInsightsView.tsx      ← AI Insights page
│   │   ├── MarketNewsView.tsx      ← Market News page
│   │   ├── ReportsView.tsx         ← Reports + download buttons
│   │   └── SettingsView.tsx       ← Settings form + theme + notifications
│   ├── StatCard.tsx               ← Reusable summary number cards (dashboard stats)
│   ├── ChartCard.tsx              ← Commodity price line chart + filters (Recharts)
│   ├── CommodityTable.tsx         ← Market table (commodity, price, change, signal…)
│   ├── CommodityDetailCharts.tsx  ← Detail page: price + moving averages + volume charts
│   ├── PortfolioPieChart.tsx      ← Portfolio allocation pie chart
│   ├── AIInsightCard.tsx          ← AI text insight block
│   ├── NewsCard.tsx               ← Single news card
│   └── ReportCard.tsx             ← Single report row with PDF/CSV actions
│
├── store/                         ← App state (Zustand)
│   ├── userStore.ts               ← User profile, theme, notification toggles
│   ├── marketDataStore.ts         ← Market rows, chart data, search, live price updates
│   ├── portfolioStore.ts          ← Holdings and allocation
│   └── aiInsightsStore.ts         ← AI summaries, predictions, signals
│
├── styles/
│   ├── tokens.css                 ← Colors, spacing, theme variables (light/dark)
│   ├── globals.css                ← Base page styles, imports tokens
│   └── components.css             ← Layout and component class names (`.ca-…`)
│
├── lib/
│   ├── mock-data.ts               ← Sample commodities, news, portfolio, AI text
│   ├── constants.ts               ← Nav links, commodity lists, time ranges
│   └── report-csv.ts              ← Text used for CSV downloads on Reports page
│
├── types/
│   └── models.ts                  ← Shared TypeScript shapes (commodity, news, etc.)
│
└── utils/
    └── format.ts                  ← Money and percent formatting helpers
```

### Screens: URL → page file → main view component

| App section (what you see) | Browser path | Page file | Main “view” component |
|----------------------------|--------------|-----------|------------------------|
| Dashboard (home) | `/` | `src/app/(dashboard)/page.tsx` | `DashboardView.tsx` |
| Commodities | `/commodities` | `src/app/(dashboard)/commodities/page.tsx` | `CommoditiesView.tsx` |
| Commodity detail | `/commodities/gold` (etc.) | `src/app/(dashboard)/commodities/[symbol]/page.tsx` | `CommodityDetailView.tsx` |
| Portfolio | `/portfolio` | `src/app/(dashboard)/portfolio/page.tsx` | `PortfolioView.tsx` |
| AI Insights | `/ai-insights` | `src/app/(dashboard)/ai-insights/page.tsx` | `AiInsightsView.tsx` |
| Market News | `/market-news` | `src/app/(dashboard)/market-news/page.tsx` | `MarketNewsView.tsx` |
| Reports | `/reports` | `src/app/(dashboard)/reports/page.tsx` | `ReportsView.tsx` |
| Settings | `/settings` | `src/app/(dashboard)/settings/page.tsx` | `SettingsView.tsx` |

### Reusable UI pieces: file → where it appears

| File | Used for / appears on |
|------|------------------------|
| `Sidebar.tsx` | Left menu on **every** screen (desktop/tablet). |
| `TopNavbar.tsx` | Top bar on **every** screen (search affects market table filtering). |
| `BottomNav.tsx` | Bottom shortcuts on **phone-sized** screens. |
| `AppShell.tsx` | Wraps page content with sidebar + top bar + mobile nav. |
| `AppProviders.tsx` | Runs once when the app loads: fetch demo data, start live price simulation. |
| `StatCard.tsx` | **Dashboard** — the four summary cards at the top. |
| `ChartCard.tsx` | **Dashboard** and **Commodities** — interactive price chart. |
| `CommodityTable.tsx` | **Dashboard** and **Commodities** — market data table. |
| `CommodityDetailCharts.tsx` | **Commodity detail** — price, moving average, volume charts. |
| `PortfolioPieChart.tsx` | **Portfolio** — allocation pie chart. |
| `AIInsightCard.tsx` | **AI Insights** and **Commodity detail** — paragraph insight blocks. |
| `NewsCard.tsx` | **Market News** — each article card. |
| `ReportCard.tsx` | **Reports** — each downloadable report row. |

### Data and API (for integrations)

| Location | Purpose |
|----------|---------|
| `src/lib/mock-data.ts` | All **demo** numbers and text in one place—easy to replace later. |
| `src/app/api/.../route.ts` | Each file answers one **API path** (JSON or PDF) the front end calls. |

---

## Downloads and privacy

- **PDF reports** are generated when you click download; your browser may save them or open them in a new tab.  
- **CSV files** are created from the same demo data when you click download.  
- **Settings** (name, email, theme, some toggles) for this demo are stored in **your browser’s local storage** on this computer only—they are not sent to a company server unless your team later adds that.

---

## If something goes wrong

| Problem | What to try |
|---------|-------------|
| `node` is not recognized | Install Node.js from [nodejs.org](https://nodejs.org) and restart the terminal. |
| Port 3000 already in use | Close other apps using that port, or ask a developer to change the port in the start command. |
| Page shows an error after changing code | Stop the server (Ctrl + C), run `npm install` again, then `npm run dev`. |
| Blank page or old version | Hard refresh the browser (Ctrl + F5 on Windows) or clear cache for localhost. |

---

## Getting help from a developer

If you hand this project to someone technical, they may ask for:

- **Node version** — from `node -v`  
- **npm version** — from `npm -v`  
- **Exact error message** — copy the text from the terminal or browser  

The project uses **Next.js 14**, **React**, **TypeScript**, **plain CSS**, **Recharts** (charts), and **Zustand** (state). Sample data is served through routes under `/api/...` so it can later be replaced with a real database or **Supabase** without changing how the screens look.

---

## Summary

- **What it is:** A browser-based commodity analytics dashboard with demo data.  
- **What you need:** Node.js installed.  
- **How to run:** In the project folder, `npm install` then `npm run dev`, then open **http://localhost:3000**.  
- **No secret keys or config files** are required for the basic demo.

If you only remember one command, remember: **`npm run dev`** after **`npm install`**.
