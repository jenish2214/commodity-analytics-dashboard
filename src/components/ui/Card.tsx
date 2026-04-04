import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Visually elevate card (default uses .ca-card) */
  padded?: boolean;
};

export function Card({ children, className = "", padded = true, ...rest }: Props) {
  return (
    <div
      className={`ca-card${padded ? "" : " ca-card--flush"} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
