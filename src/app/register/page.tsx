"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";

export default function RegisterPage() {
  const auth = useTranslations("auth");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.localStorage.setItem("winperium-mvp-session", "true");
    window.location.href = "/onboarding";
  }

  return (
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold tracking-normal">{auth.createAccount}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{auth.buildRoutine}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={auth.name}><Input name="name" placeholder={auth.namePlaceholder} /></FieldLabel>
          <FieldLabel label={auth.email}><Input name="email" type="text" placeholder={auth.emailPlaceholder} /></FieldLabel>
          <FieldLabel label={auth.password}><Input name="password" type="password" placeholder="••••••••" /></FieldLabel>
          <FieldLabel label={auth.confirmPassword}><Input name="confirmPassword" type="password" placeholder="••••••••" /></FieldLabel>
          <FieldLabel label={auth.pageLanguage}><LanguageSelect /></FieldLabel>
          <Button type="submit">{auth.createAccount}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          {auth.alreadyHaveAccount} <Link href="/login" className="font-bold text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4">{auth.login}</Link>
        </p>
      </Card>
    </main>
  );
}
