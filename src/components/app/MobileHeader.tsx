import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { InstallAppButton } from "./InstallAppButton";
import { PageInfoButton } from "./PageInfoButton";
import type { PageInfoKey } from "@/data/pageInfo";

export function MobileHeader({ title, infoPage }: { title: string; infoPage?: PageInfoKey }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background-primary)]/78 px-5 py-3 pl-20 backdrop-blur-2xl lg:fixed lg:right-8 lg:top-6 lg:rounded-[1.25rem] lg:border lg:border-[var(--border-soft)] lg:bg-[var(--surface-ambient)] lg:p-2 lg:pl-2 lg:shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex min-w-0 max-w-3xl items-center justify-between gap-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="display-title metallicPageTitle min-w-0 break-words text-[clamp(1.65rem,8vw,2.15rem)] leading-[0.88] text-[var(--text-primary)]">
            {title}
          </h1>
          {infoPage ? <PageInfoButton page={infoPage} className="size-8" /> : null}
        </div>
        <Link
          href="/dashboard"
          aria-label="Winperium"
          className="shrink-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-offset-4"
        >
          <BrandMark
            showWordmark={false}
            iconClassName="size-9 text-[var(--text-primary)]"
          />
        </Link>
      </div>

      <div className="hidden items-center justify-end gap-3 lg:flex">
        <Link
          href="/dashboard"
          aria-label="Winperium"
          className="min-w-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-offset-4"
        >
          <BrandMark
            className="gap-3.5"
            iconClassName="size-9 text-[var(--text-primary)]"
            wordmarkClassName="text-[2rem]"
          />
        </Link>
        <InstallAppButton labelClassName="max-[339px]:hidden" />
      </div>
    </header>
  );
}
