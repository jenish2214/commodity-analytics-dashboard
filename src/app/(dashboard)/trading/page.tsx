"use client";

import { TradingView } from "@/components/TradingView";

export default function TradingPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
        Trading View
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Advanced charting and analysis tools for commodity trading
      </p>
      
      <TradingView showFullChart={true} />
    </div>
  );
}
