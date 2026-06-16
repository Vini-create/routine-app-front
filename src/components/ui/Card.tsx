import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "alfredSurface rounded-2xl border p-5 text-[#F6F1E8] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(0,0,0,0.5),0_0_0_1px_rgba(184,115,51,0.24)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
