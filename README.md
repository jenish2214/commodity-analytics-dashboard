# 📊 Commodity Analytics Dashboard

A modern, real-time financial dashboard for tracking commodities, market indices, and global financial news with advanced charting capabilities.

## 🎯 Purpose & Features

### **What This Dashboard Does:**
- **Track Commodities**: Real-time prices for Gold, Silver, Crude Oil, Natural Gas, and Copper
- **Global Market Indices**: Monitor 20+ market indices from around the world (S&P 500, NASDAQ, FTSE, etc.)
- **Live News Feed**: Real-time financial news from 20+ premium sources (Bloomberg, CNBC, BBC, Reuters, etc.)
- **Advanced Charting**: Interactive charts with technical indicators (SMA, EMA, RSI, Volume)
- **AI Insights**: Market analysis and trading signals based on real data
- **Portfolio Management**: Track your commodity investments and performance

### **Who This Is For:**
- **Traders & Investors**: Monitor market movements and make informed decisions
- **Financial Analysts**: Research commodities and global market trends
- **Business Professionals**: Stay updated with real-time financial news
- **Data Enthusiasts**: Explore financial data with interactive visualizations

---

## 🚀 Quick Start

### **For Non-Technical Users:**

#### **1. Open the Dashboard**
```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

#### **2. Access Features**
- **Dashboard**: Overview of all commodities and market summary
- **Commodities**: Detailed commodity prices and charts
- **Market Indices**: Global market indices by country
- **Market News**: Categorized news from multiple sources
- **AI Insights**: Automated market analysis
- **Portfolio**: Track your investments

#### **3. Customize Your Experience**
- **Chart Settings**: Click the Settings button on charts to choose indicators
- **News Filters**: Filter by category (Business, Technology, Political) or source
- **Market Filters**: Filter indices by country or region

### **For Technical Users:**

#### **1. Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

#### **2. Installation**
```bash
git clone <repository-url>
cd commodity-analytics-dashboard
npm install
```

#### **3. Environment Setup**
```bash
# Copy environment file
cp .env.example .env.local

# No API keys required - uses free public APIs
```

#### **4. Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

---

## 📁 Project Structure

### **Simple Overview:**
```
├── 📂 src/
│   ├── 📂 app/                 # Next.js pages and API routes
│   │   ├── 📂 api/           # Backend API endpoints
│   │   │   ├── 📄 commodities/    # Commodity prices API
│   │   │   ├── 📄 news/           # News aggregation API  
│   │   │   └── 📄 indices/         # Market indices API
│   │   └── 📂 (dashboard)/     # Frontend pages
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 views/           # Page components
│   │   ├── 📂 layout/          # Layout components
│   │   └── 📄 *.tsx           # Individual components
│   ├── 📂 store/              # State management (Zustand)
│   ├── 📂 lib/               # Utilities and helpers
│   ├── 📂 types/             # TypeScript type definitions
│   └── 📂 styles/            # CSS and styling
├── 📄 package.json           # Dependencies and scripts
├── 📄 README.md             # This file
└── 📄 .env.local            # Environment variables
```

### **Key Files Explained:**

#### **📊 API Routes (`src/app/api/`)**
- **`commodities/route.ts`**: Fetches real commodity prices from Yahoo Finance
- **`commodities/chart/route.ts`**: Historical chart data for technical analysis
- **`news/route.ts`**: Aggregates news from 20+ RSS feeds
- **`indices/route.ts`**: Global market indices data
- **`ai-insights/route.ts`**: Generates AI-powered market analysis

#### **🎨 Components (`src/components/`)**
- **`ChartCard.tsx`**: Interactive charts with technical indicators
- **`MarketIndicesView.tsx`**: Global market indices display
- **`MarketNewsView.tsx`**: News feed with filtering
- **`AppProviders.tsx`**: App-wide state and data fetching

#### **🗄️ State Management (`src/store/`)**
- **`marketDataStore.ts`**: Commodity prices and chart data
- **`newsStore.ts`**: News articles and filtering
- **`chartPreferencesStore.ts`**: User chart customization settings

---

## 🔧 Technical Architecture

### **Data Flow:**
```
🌐 External APIs
    ├── Yahoo Finance (Commodities & Indices)
    ├── RSS Feeds (News from 20+ sources)
    └── Market Data APIs
        ↓
📡 Next.js API Routes (Server-side)
    ├── Data fetching & processing
    ├── Error handling & caching
    └── Data transformation
        ↓
🎯 Frontend Components
    ├── Real-time updates
    ├── Interactive visualizations
    └── User preferences
```

### **Key Technologies:**
- **Frontend**: Next.js 14, React 18, TypeScript
- **State Management**: Zustand with persistence
- **Charts**: Recharts for interactive visualizations
- **Styling**: CSS variables, responsive design
- **Data Sources**: Yahoo Finance API, RSS feeds
- **Caching**: Next.js built-in caching with revalidation

### **API Integration:**
- **No API Keys Required**: Uses free public APIs
- **Rate Limiting**: Built-in caching prevents API limits
- **Error Handling**: Graceful fallbacks for API failures
- **Real-time Updates**: Auto-refresh every 5 minutes

---

## 📊 Features Deep Dive

### **🎯 Chart Capabilities:**
- **Chart Types**: Line, Area, Candlestick
- **Technical Indicators**: 
  - SMA (Simple Moving Average)
  - EMA (Exponential Moving Average) 
  - RSI (Relative Strength Index)
  - Volume bars
- **Customization**: User preferences saved locally
- **Time Ranges**: 1D, 1W, 1M, 6M, 1Y

### **📰 News System:**
- **Sources**: Bloomberg, CNBC, BBC, Reuters, Financial Times, Wall Street Journal, TechCrunch, The Verge, Ars Technica, Wired, CNN, Politico, The Guardian, Al Jazeera, and more
- **Categories**: Business, Technology, Political, Commodities, Energy, Markets, World
- **Filtering**: By category, source, or both
- **Real-time**: Updates every 2 minutes

### **🌍 Market Indices:**
- **Coverage**: 20+ global indices
- **Regions**: 
  - **US**: S&P 500, Dow Jones, NASDAQ, Russell 2000, VIX
  - **Europe**: FTSE 100, DAX, CAC 40, Euro Stoxx 50, AEX
  - **Asia**: Nikkei 225, Hang Seng, Shanghai Composite, Straits Times, Sensex, Nifty 50
  - **Other**: TSX (Canada), ASX 200 (Australia), IPC Mexico, Bovespa (Brazil)
- **Real-time**: Live prices with market status
- **Auto-refresh**: Updates every 5 minutes

### **🤖 AI Insights:**
- **Market Sentiment**: Bullish/Bearish analysis
- **Trading Signals**: BUY/HOLD/SELL recommendations
- **Predictions**: Price movement forecasts
- **Real Analysis**: Based on current market data

---

## 🛠️ Development Guide

### **Adding New Features:**

#### **1. New API Route:**
```typescript
// src/app/api/new-feature/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Your API logic here
  return NextResponse.json({ data: "your data" });
}
```

#### **2. New Component:**
```typescript
// src/components/NewComponent.tsx
"use client";

export function NewComponent() {
  return <div>Your component</div>;
}
```

#### **3. New Page:**
```typescript
// src/app/(dashboard)/new-page/page.tsx
import { NewComponent } from "@/components/NewComponent";

export default function NewPage() {
  return <NewComponent />;
}
```

### **State Management:**
```typescript
// src/store/newStore.ts
import { create } from "zustand";

export const useNewStore = create((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
```

### **Styling:**
```css
/* Use CSS variables for theming */
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

---

## 🔧 Configuration

### **Environment Variables:**
```bash
# .env.local - No API keys required!
# All data sources use free public APIs

# Optional: Custom API endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### **Caching Strategy:**
- **Commodity Prices**: 5 minutes
- **Chart Data**: 1 hour  
- **News**: 15 minutes
- **Market Indices**: 5 minutes

### **Performance Optimizations:**
- **Server-side Rendering**: Next.js API routes
- **Client-side Caching**: Zustand persistence
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js

---

## 🚀 Deployment

### **Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment variables configured in Vercel dashboard
```

### **Docker:**
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

### **Traditional Hosting:**
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🔍 Troubleshooting

### **Common Issues:**

#### **📊 Chart Not Showing:**
- **Check**: Console for API errors
- **Verify**: Network connectivity to Yahoo Finance
- **Solution**: Wait for auto-refresh or manually refresh

#### **📰 News Not Loading:**
- **Check**: RSS feed accessibility
- **Verify**: No CORS blocking
- **Solution**: Check network and try different source

#### **🌍 Indices Not Updating:**
- **Check**: Market hours (some indices closed weekends)
- **Verify**: API rate limits not exceeded
- **Solution**: Wait for next auto-refresh cycle

### **Debug Mode:**
```bash
# Enable debug logging
DEBUG=true npm run dev

# Check browser console for detailed logs
```

---

## 🤝 Contributing

### **Getting Started:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit changes: `git commit -m "Add feature"`
6. Push to fork: `git push origin feature-name`
7. Create Pull Request

### **Code Style:**
- **TypeScript**: Strict typing required
- **Components**: Functional components with hooks
- **Styling**: CSS variables, responsive design
- **API**: Error handling with graceful fallbacks

### **Testing:**
```bash
# Run unit tests
npm run test

# Run integration tests  
npm run test:integration

# Check code quality
npm run lint
npm run type-check
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🆘 Support

### **📧 Contact:**
- **Issues**: Create GitHub issue for bugs
- **Features**: Request enhancements via GitHub discussions
- **Questions**: Use GitHub discussions for general help

### **📚 Resources:**
- **Documentation**: This README file
- **API Documentation**: Code comments in API routes
- **Component Examples**: Storybook (if available)

---

## 🎉 Acknowledgments

### **Data Sources:**
- **Yahoo Finance**: Commodity prices and market indices
- **RSS Feeds**: News from 20+ financial sources
- **Market APIs**: Real-time market data

### **Technologies:**
- **Next.js**: React framework and API routes
- **Zustand**: Lightweight state management
- **Recharts**: Interactive charting library
- **Lucide React**: Beautiful icon library

---

**🚀 Ready to explore the world of commodities and financial markets?**

**Start the dashboard and begin your journey into real-time financial analytics!**
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
