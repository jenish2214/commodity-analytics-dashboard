type Props = {
  label: string;
  value: string;
  hint?: string;
  badge?: string;
};

export function StatCard({ label, value, hint, badge }: Props) {
  return (
    <article className="ca-card ca-stat-card">
      <p className="ca-stat-card__label">{label}</p>
      <p className="ca-stat-card__value">{value}</p>
      {hint ? <p className="ca-stat-card__hint">{hint}</p> : null}
      {badge ? (
        <p style={{ marginTop: "0.5rem" }}>
          <span className="ca-pill ca-pill--accent">{badge}</span>
        </p>
      ) : null}
    </article>
  );
}
