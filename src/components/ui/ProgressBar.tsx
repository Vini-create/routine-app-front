import { percentageLabel } from "@/lib/utils";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400"
        style={{ width: percentageLabel(value) }}
      />
    </div>
  );
}
