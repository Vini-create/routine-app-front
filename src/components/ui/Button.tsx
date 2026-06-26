import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  href?: string;
  children: ReactNode;
};

const variants = {
  primary:
    "metallicButton border border-transparent hover:-translate-y-px active:brightness-95 disabled:border-[var(--border-soft)] disabled:bg-[var(--surface-ambient)] disabled:text-[var(--text-tertiary)]",
  secondary:
    "metallicButtonSecondary border hover:-translate-y-px",
  ghost:
    "border border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]",
  danger: "border border-[var(--border-strong)] bg-[var(--surface-ambient)] text-[var(--text-primary)] shadow-soft hover:bg-[var(--surface-standard)]",
};

export function Button({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-[1.35rem] px-5 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
