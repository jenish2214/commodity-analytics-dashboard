import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "positive" | "negative" | "neutral";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const cls =
    tone === "positive"
      ? "ui-badge ui-badge--pos"
      : tone === "negative"
        ? "ui-badge ui-badge--neg"
        : "ui-badge";
  return <span className={cls}>{children}</span>;
}
