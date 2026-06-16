import { percentageLabel } from "@/lib/utils";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#2B2B31]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#B87333] to-[#C78A52]"
        style={{ width: percentageLabel(value) }}
      />
    </div>
  );
}
