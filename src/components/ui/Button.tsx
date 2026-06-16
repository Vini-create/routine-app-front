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
    "metallicButton border border-transparent text-[#F6F1E8] hover:-translate-y-0.5 hover:text-[#F6F1E8] active:brightness-90 disabled:border-[#2B2B31] disabled:bg-[#2B2B31] disabled:text-[#8B847B]",
  secondary:
    "metallicButtonSecondary border text-[#F6F1E8] hover:-translate-y-0.5 hover:text-[#F6F1E8]",
  ghost:
    "border border-transparent text-[#D8B08C] hover:bg-[#D8B08C]/10 hover:text-[#C78A52]",
  danger: "border border-red-500/40 bg-red-950/40 text-red-100 shadow-soft hover:bg-red-900/70 hover:text-white",
};

export function Button({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70",
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
