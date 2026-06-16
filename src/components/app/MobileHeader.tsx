import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#2B2B31] bg-[#0B0B0D]/85 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <BrandMark
            className="gap-3.5"
            iconClassName="size-13 text-[#F6F1E8] sm:size-14"
          />
        </div>
        <Link
          href="/feedback"
          className="metallicButtonSecondary shrink-0 rounded-xl border px-3 py-2 text-center text-[11px] font-bold text-[#F6F1E8] shadow-soft backdrop-blur transition sm:px-4 sm:text-xs"
        >
          Feedback<span className="hidden sm:inline"> de rotina</span>
        </Link>
      </div>
    </header>
  );
}
