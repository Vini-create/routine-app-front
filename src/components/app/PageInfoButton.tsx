"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { pageInfo, type PageInfoKey } from "@/data/pageInfo";
import { cn } from "@/lib/utils";

export function PageInfoButton({ page, className }: { page: PageInfoKey; className?: string }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copy = pageInfo[language];
  const content = copy.pages[page];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function close() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn("grid size-9 shrink-0 place-items-center rounded-full border border-[var(--border-medium)] bg-[var(--surface-ambient)] font-serif text-base font-bold normal-case text-[var(--text-secondary)] shadow-soft transition hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)] sm:size-10", className)}
        aria-label={copy.buttonLabel}
        title={copy.buttonLabel}
      >
        i
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-black/60 p-4 backdrop-blur-md sm:place-items-center" onClick={close}>
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby={`page-info-${page}`}
            className="alfredModalSurface max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label-micro">Winperium</p>
                <h2 id={`page-info-${page}`} className="mt-2 break-words text-2xl font-black">{copy.buttonLabel}</h2>
              </div>
              <button type="button" onClick={close} aria-label={copy.close} className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-standard)] text-xl text-[var(--text-secondary)]">×</button>
            </div>

            <div className="mt-5 grid gap-3">
              {([
                [copy.sections.what, content.what],
                [copy.sections.why, content.why],
                [copy.sections.how, content.how],
                [copy.sections.connections, content.connections],
                ...(content.example ? [[copy.sections.example, content.example]] : []),
              ] as string[][]).map(([label, value], index) => (
                <section key={label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--text-primary)] text-[10px] font-black text-[var(--background-primary)]">{index + 1}</span>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{label}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{value}</p>
                </section>
              ))}
            </div>

            <Button type="button" className="mt-5 w-full" onClick={close}>{copy.close}</Button>
          </Card>
        </div>
      ) : null}
    </>
  );
}
