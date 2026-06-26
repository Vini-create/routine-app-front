"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";

export default function LoginPage() {
  const login = useTranslations("login");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.localStorage.setItem("winperium-mvp-session", "true");
    window.location.href = "/dashboard";
  }

  return (
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold tracking-normal">{login.title}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{login.subtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={login.email}><Input name="email" type="text" placeholder={login.emailPlaceholder} /></FieldLabel>
          <FieldLabel label={login.password}><Input name="password" type="password" placeholder="••••••••" /></FieldLabel>
          <Button type="submit">{login.submit}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          {login.noAccount} <Link href="/register" className="font-bold text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4">{login.createAccount}</Link>
        </p>
      </Card>
    </main>
  );
}
