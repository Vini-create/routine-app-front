import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "blue" | "purple" | "amber";
  className?: string;
}) {
  const tones = {
    neutral: "border-[#2B2B31] bg-[#17171A] text-[#EDE6DA]",
    green: "border-[#B87333]/50 bg-[#B87333]/14 text-[#D8B08C]",
    blue: "border-[#2B2B31] bg-[#F6F1E8]/6 text-[#F6F1E8]",
    purple: "border-[#B87333]/50 bg-[#B87333]/14 text-[#D8B08C]",
    amber: "border-[#C78A52]/60 bg-[#C78A52]/12 text-[#D8B08C]",
  };

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
