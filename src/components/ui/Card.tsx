import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
