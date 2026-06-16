import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#EDE6DA]">
      {label}
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        "min-h-12 rounded-xl border border-[#2B2B31] bg-[#17171A] px-4 text-sm text-[#F6F1E8] outline-none transition placeholder:text-[#8B847B] focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/12",
        props.className,
      )}
    />
  );
});

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 rounded-xl border border-[#2B2B31] bg-[#17171A] px-4 py-3 text-sm text-[#F6F1E8] outline-none transition placeholder:text-[#8B847B] focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/12",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 rounded-xl border border-[#2B2B31] bg-[#17171A] px-4 text-sm text-[#F6F1E8] outline-none transition focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/12",
        props.className,
      )}
    />
  );
}
