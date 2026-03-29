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

## Folder map (simple)

You do not need to edit these to use the app. This is only so you know where things live if someone asks.

| Location | What it is for (in simple terms) |
|----------|-----------------------------------|
| `src/app` | **Pages** and **URLs** (each screen of the website). |
| `src/components` | **Reusable pieces** of the interface (menus, cards, charts). |
| `src/styles` | **Colors and layout** rules (no Tailwind; custom CSS files). |
| `src/store` | **In-memory settings** while you use the app (theme, market data, etc.). |
| `src/lib` | **Sample data** and helpers used by the demo. |
| `src/app/api` | **Small web endpoints** that return sample JSON or PDF files for downloads. |

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
