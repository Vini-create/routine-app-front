import { percentageLabel } from "@/lib/utils";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="winperiumProgressTrack h-2.5 overflow-hidden rounded-full bg-[var(--border-soft)]">
      <div
        className="winperiumProgressFill h-full rounded-full"
        style={{ width: percentageLabel(value) }}
      />
    </div>
  );
}
