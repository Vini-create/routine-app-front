"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { register } from "@/lib/authApi";

export default function RegisterPage() {
  const auth = useTranslations("auth");
  const { language } = useLanguage();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // API_CONNECTION_POINT: this already calls the auth client; replace the local fallback with the real API.
    await register({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      language,
    });

    window.location.href = "/onboarding";
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f4ee] px-5 py-10 text-zinc-950 dark:bg-[#080807] dark:text-zinc-50">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tight">{auth.createAccount}</h1>
        <p className="mt-2 text-sm text-zinc-500">{auth.buildRoutine}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={auth.name}><Input name="name" placeholder={auth.namePlaceholder} /></FieldLabel>
          <FieldLabel label={auth.email}><Input name="email" type="email" placeholder={auth.emailPlaceholder} /></FieldLabel>
          <FieldLabel label={auth.password}><Input name="password" type="password" placeholder="••••••••" /></FieldLabel>
          <FieldLabel label={auth.confirmPassword}><Input name="confirmPassword" type="password" placeholder="••••••••" /></FieldLabel>
          <FieldLabel label={auth.pageLanguage}><LanguageSelect /></FieldLabel>
          <Button type="submit">{auth.createAccount}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-zinc-500">
          {auth.alreadyHaveAccount} <Link href="/login" className="font-bold text-zinc-950 dark:text-white">{auth.login}</Link>
        </p>
      </Card>
    </main>
  );
}
