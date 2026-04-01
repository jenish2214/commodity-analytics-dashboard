"use client";

import {
  useUserStore,
  type GoldBarWeightMode,
} from "@/store/userStore";

const OPTIONS: { id: GoldBarWeightMode; label: string }[] = [
  { id: "10g", label: "10 g" },
  { id: "100g", label: "100 g" },
  { id: "1kg", label: "1 kg" },
  { id: "all", label: "All" },
];

type Props = {
  ariaPrefix?: string;
};

/** Single control: pick one bar size or All (persisted). */
export function GoldWeightTicketSelector({ ariaPrefix = "gold-bar" }: Props) {
  const mode = useUserStore((s) => s.goldBarWeight);
  const setMode = useUserStore((s) => s.setGoldBarWeight);

  return (
    <div
      className="ca-seg"
      style={{ marginBottom: "1rem" }}
      role="radiogroup"
      aria-label="Gold bar price to show"
    >
      <div className="ca-seg__label">Gold bar price</div>
      <div
        className="ca-seg__group"
        style={{
          flexWrap: "wrap",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 4,
          gap: 4,
        }}
      >
        {OPTIONS.map(({ id, label }) => {
          const selected = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? "ca-chip ca-chip--active" : "ca-chip"}
              style={{ margin: 0 }}
              aria-label={`${ariaPrefix}-${id}`}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
