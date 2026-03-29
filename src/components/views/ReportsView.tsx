"use client";

import { ReportCard } from "@/components/ReportCard";
import {
  aiPredictionReportCsv,
  commodityPerformanceReportCsv,
  monthlyPortfolioReportCsv,
} from "@/lib/report-csv";
import { reportItems } from "@/lib/mock-data";

const csvById: Record<string, () => string> = {
  r1: monthlyPortfolioReportCsv,
  r2: commodityPerformanceReportCsv,
  r3: aiPredictionReportCsv,
};

const pdfTypeById: Record<string, string> = {
  r1: "monthly",
  r2: "performance",
  r3: "ai",
};

export function ReportsView() {
  return (
    <div className="ca-page">
      <h1 className="ca-page__title">Reports</h1>
      <p className="ca-page__lead">
        Export portfolio, performance, and AI prediction packets.
      </p>
      <div style={{ display: "grid", gap: "1rem" }}>
        {reportItems.map((r) => (
          <ReportCard
            key={r.id}
            title={r.title}
            description={r.description}
            csvFilename={`${r.id}-report.csv`}
            csvContent={csvById[r.id]()}
            pdfType={pdfTypeById[r.id]}
          />
        ))}
      </div>
    </div>
  );
}
