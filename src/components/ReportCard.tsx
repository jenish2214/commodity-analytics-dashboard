"use client";

type Props = {
  title: string;
  description: string;
  csvFilename: string;
  csvContent: string;
  pdfType: string;
};

export function ReportCard({
  title,
  description,
  csvFilename,
  csvContent,
  pdfType,
}: Props) {
  const downloadCsv = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    window.open(`/api/reports/pdf?type=${encodeURIComponent(pdfType)}`, "_blank");
  };

  return (
    <article className="ca-card">
      <h3 className="ca-page__title" style={{ fontSize: "1rem", marginBottom: "0.35rem" }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.9375rem" }}>{description}</p>
      <div className="ca-report-actions">
        <button type="button" className="ca-btn ca-btn--primary" onClick={downloadPdf}>
          Download PDF
        </button>
        <button type="button" className="ca-btn" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>
    </article>
  );
}
