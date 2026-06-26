import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background-primary)]/78 px-5 py-3 pl-20 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <BrandMark
            className="gap-3.5"
            iconClassName="size-11 text-[var(--text-primary)] sm:size-12"
          />
        </div>
        <Link
          href="/feedback"
          className="metallicButtonSecondary shrink-0 rounded-xl border px-3 py-2 text-center text-[11px] font-bold shadow-soft backdrop-blur transition sm:px-4 sm:text-xs"
        >
          Feedback<span className="hidden sm:inline"> de rotina</span>
        </Link>
      </div>
    </header>
  );
}
