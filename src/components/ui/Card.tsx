import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "alfredSurface min-w-0 max-w-full rounded-[1.65rem] border p-5 text-[var(--text-primary)] transition duration-200 hover:-translate-y-px",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
