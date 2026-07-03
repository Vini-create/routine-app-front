import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="alfredPage min-h-dvh px-5 py-10">
      <article className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-standard)] p-6 shadow-soft sm:p-10">
        <BrandMark className="mb-8" />
        <h1 className="font-brand text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--text-tertiary)]">Última atualização: 3 de julho de 2026</p>
        <div className="mt-8 grid gap-7 text-sm leading-7 text-[var(--text-secondary)]">{children}</div>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-[var(--border-soft)] pt-6 text-sm font-bold">
          <Link href="/register" className="underline underline-offset-4">Criar conta</Link>
          <Link href="/" className="underline underline-offset-4">Voltar ao início</Link>
        </div>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-2 text-lg font-bold text-[var(--text-primary)]">{title}</h2>{children}</section>;
}
