import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...rest
}: Props) {
  const v =
    variant === "ghost"
      ? "ui-btn ui-btn--ghost"
      : variant === "outline"
        ? "ui-btn ui-btn--outline"
        : "ui-btn ui-btn--primary";
  return (
    <button type={type} className={`${v} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
