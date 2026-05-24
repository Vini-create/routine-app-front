import Link from "next/link";

export function MobileHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100/80 bg-[#f7f4ee]/85 px-5 py-4 backdrop-blur dark:border-zinc-900 dark:bg-[#080807]/85">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
            Rotina AI
          </p>
          <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
        </div>
        <Link
          href="/feedback"
          className="shrink-0 rounded-2xl border border-zinc-200 bg-white/70 px-3 py-2 text-center text-[11px] font-black text-zinc-700 shadow-[0_12px_34px_-28px_rgba(24,24,27,0.8)] backdrop-blur transition hover:bg-white hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.1] dark:hover:text-white sm:px-4 sm:text-xs"
        >
          Feedback<span className="hidden sm:inline"> de rotina</span>
        </Link>
      </div>
    </header>
  );
}
