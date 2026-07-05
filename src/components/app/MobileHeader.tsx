import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { InstallAppButton } from "./InstallAppButton";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background-primary)]/78 px-5 py-3 pl-20 backdrop-blur-2xl lg:fixed lg:right-8 lg:top-6 lg:rounded-[1.25rem] lg:border lg:border-[var(--border-soft)] lg:bg-[var(--surface-ambient)] lg:p-2 lg:pl-2 lg:shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 lg:max-w-none lg:justify-end">
        <Link
          href="/dashboard"
          aria-label="Winperium"
          className="min-w-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-offset-4"
        >
          <BrandMark
            className="gap-1.5 sm:gap-3.5"
            iconClassName="size-8 text-[var(--text-primary)] sm:size-12 lg:size-9"
            wordmarkClassName="text-[1.3rem] sm:text-[2.35rem] lg:text-[2rem]"
          />
        </Link>
        <InstallAppButton labelClassName="max-[339px]:hidden" />
      </div>
    </header>
  );
}
