type Props = {
  title: string;
  body: string;
  footer?: string;
};

export function AIInsightCard({ title, body, footer }: Props) {
  return (
    <article className="ca-card" style={{ marginBottom: "1rem" }}>
      <h3
        className="ca-page__title"
        style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
      >
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: 1.55 }}>{body}</p>
      {footer ? (
        <p
          style={{
            margin: "0.75rem 0 0",
            fontSize: "12px",
            color: "var(--color-label)",
          }}
        >
          {footer}
        </p>
      ) : null}
    </article>
  );
}
