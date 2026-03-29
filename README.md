---
# Commodity Analytics Dashboard

A professional browser-based commodity analytics dashboard built with
Next.js 14, TypeScript, Zustand, and plain CSS.

## Latest changes
- User profile avatar at sidebar bottom now opens Settings
- Sidebar hidden completely on the Settings page (full-width layout)
- Font locked to Poppins — selector removed from UI entirely
- Dark/Light mode cards redesigned to be visible in both themes
- Settings nav item removed from sidebar

## Pages

| Page | URL | Description |
|---|---|---|
| Dashboard | / | Stats, chart, market table |
| Commodities | /commodities | Commodity list and charts |
| Commodity detail | /commodities/[symbol] | Price history, indicators |
| Portfolio | /portfolio | Holdings CRUD, gain/loss |
| AI Insights | /ai-insights | Summaries and signals |
| Market News | /market-news | News cards |
| Reports | /reports | PDF and CSV downloads |
| Settings | /settings | Profile, theme, notifications |

## How to open Settings
Click your **profile avatar** at the bottom of the sidebar.
The sidebar disappears on the Settings page for a clean full-width view.

## Theme
- Default: Dark (black background, white text)
- Toggle: Settings → Appearance → Dark / Light cards
- All color transitions: 300ms smooth

## Font
Poppins (400, 500, 600, 700) — hardcoded globally via Google Fonts.
No font selector — consistent typography throughout.

## Setup
1. Install Node.js 18+ from https://nodejs.org
2. Open terminal in the project folder
3. npm install
4. npm run dev
5. Open http://localhost:3000

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Zustand (with localStorage persistence)
- Recharts (charts)
- Plain CSS (CSS custom properties)
- lucide-react (icons)
- Google Fonts — Poppins

## Data & privacy
All data is demo/sample data.
Settings persist in browser localStorage only — nothing is sent to a server.

localStorage keys:
- ca_user_settings → theme, name, email, notifications, sidebarState
- ca_portfolio     → portfolio items (add/edit/delete)

## Folder structure (src/)
app/          → pages and API routes
components/   → layout, views, reusable UI
store/        → Zustand stores
styles/       → tokens.css, globals.css, components.css
lib/          → mock data, constants
types/        → TypeScript models
utils/        → format helpers
---
